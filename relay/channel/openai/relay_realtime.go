package openai

import (
	"fmt"
	"io"
	"sync"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/QuantumNous/new-api/relaykit/types"
	"github.com/QuantumNous/new-api/service"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func OpenaiRealtimeHandler(c *gin.Context, info *relaycommon.RelayInfo) (*types.NewAPIError, *dto.RealtimeUsage) {
	if info == nil || info.ClientWs == nil || info.TargetWs == nil {
		return types.NewError(fmt.Errorf("invalid websocket connection"), types.ErrorCodeBadResponse), nil
	}

	info.IsStream = true
	clientConn := info.ClientWs
	targetConn := info.TargetWs

	clientClosed := make(chan struct{})
	targetClosed := make(chan struct{})
	sendChan := make(chan []byte, 100)
	receiveChan := make(chan []byte, 100)
	errChan := make(chan error, 2)

	var usageMu sync.Mutex
	finished := false
	var reservationFailed bool
	usage := &dto.RealtimeUsage{}
	localUsage := &dto.RealtimeUsage{}
	sumUsage := &dto.RealtimeUsage{}

	gopool.Go(func() {
		defer func() {
			if r := recover(); r != nil {
				errChan <- fmt.Errorf("panic in client reader: %v", r)
			}
		}()
		for {
			select {
			case <-c.Done():
				return
			default:
				_, message, err := clientConn.ReadMessage()
				if err != nil {
					if !websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
						errChan <- fmt.Errorf("error reading from client: %v", err)
					}
					close(clientClosed)
					return
				}

				realtimeEvent := &dto.RealtimeEvent{}
				err = common.Unmarshal(message, realtimeEvent)
				if err != nil {
					errChan <- fmt.Errorf("error unmarshalling message: %v", err)
					return
				}

				err = func() error {
					usageMu.Lock()
					defer usageMu.Unlock()
					if finished {
						return io.EOF
					}
					if realtimeEvent.Type == dto.RealtimeEventTypeSessionUpdate {
						if realtimeEvent.Session != nil {
							if realtimeEvent.Session.Tools != nil {
								info.RealtimeTools = realtimeEvent.Session.Tools
							}
						}
					}

					textToken, audioToken, err := service.CountTokenRealtime(info, *realtimeEvent, info.UpstreamModelName)
					if err != nil {
						return fmt.Errorf("error counting text token: %v", err)
					}
					logger.LogInfo(c, common.LogText("type: %s, textToken: %d, audioToken: %d", realtimeEvent.Type, textToken, audioToken))
					localUsage.TotalTokens += textToken + audioToken
					localUsage.InputTokens += textToken + audioToken
					localUsage.InputTokenDetails.TextTokens += textToken
					localUsage.InputTokenDetails.AudioTokens += audioToken
					return nil
				}()
				if err != nil {
					if err != io.EOF {
						errChan <- err
					}
					return
				}

				err = helper.WssString(c, targetConn, string(message))
				if err != nil {
					errChan <- fmt.Errorf("error writing to target: %v", err)
					return
				}

				select {
				case sendChan <- message:
				default:
				}
			}
		}
	})

	gopool.Go(func() {
		defer func() {
			if r := recover(); r != nil {
				errChan <- fmt.Errorf("panic in target reader: %v", r)
			}
		}()
		for {
			select {
			case <-c.Done():
				return
			default:
				_, message, err := targetConn.ReadMessage()
				if err != nil {
					if !websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
						errChan <- fmt.Errorf("error reading from target: %v", err)
					}
					close(targetClosed)
					return
				}
				realtimeEvent := &dto.RealtimeEvent{}
				err = common.Unmarshal(message, realtimeEvent)
				if err != nil {
					errChan <- fmt.Errorf("error unmarshalling message: %v", err)
					return
				}

				err = func() error {
					usageMu.Lock()
					defer usageMu.Unlock()
					if finished {
						return io.EOF
					}
					info.SetFirstResponseTime()
					if realtimeEvent.Type == dto.RealtimeEventTypeResponseDone {
						var realtimeUsage *dto.RealtimeUsage
						if realtimeEvent.Response != nil {
							realtimeUsage = realtimeEvent.Response.Usage
						}
						if realtimeUsage != nil {
							usage.TotalTokens += realtimeUsage.TotalTokens
							usage.InputTokens += realtimeUsage.InputTokens
							usage.OutputTokens += realtimeUsage.OutputTokens
							usage.InputTokenDetails.AudioTokens += realtimeUsage.InputTokenDetails.AudioTokens
							usage.InputTokenDetails.CachedTokens += realtimeUsage.InputTokenDetails.CachedTokens
							usage.InputTokenDetails.TextTokens += realtimeUsage.InputTokenDetails.TextTokens
							usage.OutputTokenDetails.AudioTokens += realtimeUsage.OutputTokenDetails.AudioTokens
							usage.OutputTokenDetails.TextTokens += realtimeUsage.OutputTokenDetails.TextTokens
							err := preConsumeUsage(c, info, usage, sumUsage)
							if err != nil {
								reservationFailed = true
								return fmt.Errorf("error consume usage: %v", err)
							}
							// 本次计费完成，清除
							usage = &dto.RealtimeUsage{}

							localUsage = &dto.RealtimeUsage{}
						} else {
							textToken, audioToken, err := service.CountTokenRealtime(info, *realtimeEvent, info.UpstreamModelName)
							if err != nil {
								return fmt.Errorf("error counting text token: %v", err)
							}
							logger.LogInfo(c, common.LogText("type: %s, textToken: %d, audioToken: %d", realtimeEvent.Type, textToken, audioToken))
							localUsage.TotalTokens += textToken + audioToken
							info.IsFirstRequest = false
							localUsage.InputTokens += textToken + audioToken
							localUsage.InputTokenDetails.TextTokens += textToken
							localUsage.InputTokenDetails.AudioTokens += audioToken
							err = preConsumeUsage(c, info, localUsage, sumUsage)
							if err != nil {
								reservationFailed = true
								return fmt.Errorf("error consume usage: %v", err)
							}
							// 本次计费完成，清除
							localUsage = &dto.RealtimeUsage{}
							// print now usage
						}
						logger.LogInfo(c, common.LogText("realtime streaming sumUsage: %v", sumUsage))
						logger.LogInfo(c, common.LogText("realtime streaming localUsage: %v", localUsage))

					} else if realtimeEvent.Type == dto.RealtimeEventTypeSessionUpdated || realtimeEvent.Type == dto.RealtimeEventTypeSessionCreated {
						realtimeSession := realtimeEvent.Session
						if realtimeSession != nil {
							// update audio format
							info.InputAudioFormat = common.GetStringIfEmpty(realtimeSession.InputAudioFormat, info.InputAudioFormat)
							info.OutputAudioFormat = common.GetStringIfEmpty(realtimeSession.OutputAudioFormat, info.OutputAudioFormat)
						}
					} else {
						textToken, audioToken, err := service.CountTokenRealtime(info, *realtimeEvent, info.UpstreamModelName)
						if err != nil {
							return fmt.Errorf("error counting text token: %v", err)
						}
						logger.LogInfo(c, common.LogText("type: %s, textToken: %d, audioToken: %d", realtimeEvent.Type, textToken, audioToken))
						localUsage.TotalTokens += textToken + audioToken
						localUsage.OutputTokens += textToken + audioToken
						localUsage.OutputTokenDetails.TextTokens += textToken
						localUsage.OutputTokenDetails.AudioTokens += audioToken
					}
					return nil
				}()
				if err != nil {
					if err != io.EOF {
						errChan <- err
					}
					return
				}

				err = helper.WssString(c, clientConn, string(message))
				if err != nil {
					errChan <- fmt.Errorf("error writing to client: %v", err)
					return
				}

				select {
				case receiveChan <- message:
				default:
				}
			}
		}
	})

	select {
	case <-clientClosed:
	case <-targetClosed:
	case err := <-errChan:
		//return service.OpenAIErrorWrapper(err, "realtime_error", http.StatusInternalServerError), nil
		logger.LogError(c, common.LogText("realtime error: %s", err.Error()))
	case <-c.Done():
	}

	usageMu.Lock()
	defer usageMu.Unlock()
	finished = true
	if info.TieredBillingSnapshot == nil || !reservationFailed {
		if usage.TotalTokens != 0 {
			_ = preConsumeUsage(c, info, usage, sumUsage)
		}
		if localUsage.TotalTokens != 0 {
			_ = preConsumeUsage(c, info, localUsage, sumUsage)
		}
	}

	return nil, sumUsage
}

func preConsumeUsage(ctx *gin.Context, info *relaycommon.RelayInfo, usage *dto.RealtimeUsage, totalUsage *dto.RealtimeUsage) error {
	if usage == nil || totalUsage == nil {
		return fmt.Errorf("invalid usage pointer")
	}

	next := *totalUsage
	next.TotalTokens += usage.TotalTokens
	next.InputTokens += usage.InputTokens
	next.OutputTokens += usage.OutputTokens
	next.InputTokenDetails.CachedTokens += usage.InputTokenDetails.CachedTokens
	next.InputTokenDetails.TextTokens += usage.InputTokenDetails.TextTokens
	next.InputTokenDetails.AudioTokens += usage.InputTokenDetails.AudioTokens
	next.OutputTokenDetails.TextTokens += usage.OutputTokenDetails.TextTokens
	next.OutputTokenDetails.AudioTokens += usage.OutputTokenDetails.AudioTokens
	if info.TieredBillingSnapshot != nil {
		for _, count := range []int{usage.TotalTokens, usage.InputTokens, usage.OutputTokens,
			usage.InputTokenDetails.CachedTokens, usage.InputTokenDetails.TextTokens, usage.InputTokenDetails.AudioTokens,
			usage.OutputTokenDetails.TextTokens, usage.OutputTokenDetails.AudioTokens} {
			if count < 0 || count > common.MaxQuota {
				return fmt.Errorf("invalid realtime usage token count")
			}
		}
		if err := service.ReserveRealtimeExpressionUsage(ctx, info, &next); err != nil {
			return err
		}
		*totalUsage = next
		return nil
	}
	*totalUsage = next
	return service.PreWssConsumeQuota(ctx, info, usage)
}
