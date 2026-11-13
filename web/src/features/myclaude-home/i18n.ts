/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import type { i18n } from 'i18next'

export const HOME_NS = 'myclaude-home'

const translations = {
  en: {
    Recommended: 'Recommended',
    'USD / month': 'USD / month',
    '{{amount}} in API credit per month': '{{amount}} in API credit per month',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.',
    'Model pricing': 'Model pricing',
    'Compare model prices': 'Compare model prices',
    'Pay as you go': 'Pay as you go',
    'Compare input and output costs per million tokens.':
      'Compare input and output costs per million tokens.',
    'Get an API key': 'Get an API key',
    'Anthropic list price': 'Anthropic list price',
    '50% off': '50% off',
    '{{currency}} per million tokens': '{{currency}} per million tokens',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      'Approximate conversion · 1 USD = {{rate}} CNY',
    'Official pricing': 'Official pricing',
    'Original API guarantee': 'Original API guarantee',
    'Powered by the official Anthropic API':
      'Powered by the official Anthropic API',
    'Authentic models': 'Authentic models',
    'No substitutions or downgrades': 'No substitutions or downgrades',
    '100× compensation': '100× compensation',
    'For confirmed model impersonation': 'For confirmed model impersonation',
    'Subscription plans': 'Subscription plans',
    'Light use': 'Light use',
    'Occasional use with smaller requests.':
      'Occasional use with smaller requests.',
    'Frequent use': 'Frequent use',
    'Regular use with more requests throughout the day.':
      'Regular use with more requests throughout the day.',
    'Intensive use': 'Intensive use',
    'Extended use with larger requests.': 'Extended use with larger requests.',
    'Choose {{plan}}': 'Choose {{plan}}',
    'Payment methods': 'Payment methods',
    'Integration guide': 'Integration guide',
    'Service status': 'Service status',
    'Claude API service': 'Claude API service',
    'Contact support': 'Contact support',
  },
  zhCN: {
    Recommended: '推荐',
    'USD / month': '美元 / 月',
    '{{amount}} in API credit per month': '每月含 {{amount}} API 额度',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      '可使用所有已上线的 Claude 模型，按 MyClaude 价格扣减。未用完的额度到期清零。',
    'Model pricing': '模型价格',
    'Compare model prices': '模型价格对比',
    'Pay as you go': '按量计费',
    'Compare input and output costs per million tokens.':
      '查看每百万 Token 的输入与输出费用。',
    'Get an API key': '获取 API Key',
    'Anthropic list price': 'Anthropic 官方价',
    '50% off': '5 折',
    '{{currency}} per million tokens': '{{currency}} / 百万 Token',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      '参考换算 · 1 USD = {{rate}} CNY',
    'Official pricing': '官方定价',
    'Original API guarantee': '原厂 API 保障',
    'Powered by the official Anthropic API': '接入 Anthropic 官方 API',
    'Authentic models': '绝不掺水',
    'No substitutions or downgrades': '不换模型，不降级',
    '100× compensation': '假一赔百',
    'For confirmed model impersonation': '发现冒充模型，百倍赔付',
    'Subscription plans': '订阅套餐',
    'Light use': '轻量使用',
    'Occasional use with smaller requests.': '适合偶尔使用，每次用量较少。',
    'Frequent use': '高频使用',
    'Regular use with more requests throughout the day.':
      '适合经常使用，日常用量较多。',
    'Intensive use': '重度使用',
    'Extended use with larger requests.': '适合长时间使用，单次用量较大。',
    'Choose {{plan}}': '选择 {{plan}}',
    'Payment methods': '支付方式',
    'Integration guide': '接入文档',
    'Service status': '服务状态',
    'Claude API service': 'Claude API 服务',
    'Contact support': '联系客服',
  },
  zhTW: {
    Recommended: '推薦',
    'USD / month': '美元 / 月',
    '{{amount}} in API credit per month': '每月含 {{amount}} API 額度',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      '可使用所有已上線的 Claude 模型，按 MyClaude 費率扣減。未用完的額度到期清零。',
    'Model pricing': '模型價格',
    'Compare model prices': '模型價格比較',
    'Pay as you go': '按量計費',
    'Compare input and output costs per million tokens.':
      '查看每百萬 Token 的輸入與輸出費用。',
    'Get an API key': '取得 API Key',
    'Anthropic list price': 'Anthropic 官方價',
    '50% off': '5 折',
    '{{currency}} per million tokens': '{{currency}} / 百萬 Token',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      '參考換算 · 1 USD = {{rate}} CNY',
    'Official pricing': '官方定價',
    'Original API guarantee': '原廠 API 保障',
    'Powered by the official Anthropic API': '接入 Anthropic 官方 API',
    'Authentic models': '絕不摻水',
    'No substitutions or downgrades': '不換模型，不降級',
    '100× compensation': '假一賠百',
    'For confirmed model impersonation': '發現冒充模型，百倍賠付',
    'Subscription plans': '訂閱方案',
    'Light use': '輕量使用',
    'Occasional use with smaller requests.': '適合偶爾使用，每次用量較少。',
    'Frequent use': '高頻使用',
    'Regular use with more requests throughout the day.':
      '適合經常使用，日常用量較多。',
    'Intensive use': '重度使用',
    'Extended use with larger requests.': '適合長時間使用，單次用量較大。',
    'Choose {{plan}}': '選擇 {{plan}}',
    'Payment methods': '付款方式',
    'Integration guide': '接入文件',
    'Service status': '服務狀態',
    'Claude API service': 'Claude API 服務',
    'Contact support': '聯絡客服',
  },
  fr: {
    Recommended: 'Recommandé',
    'USD / month': 'USD / mois',
    '{{amount}} in API credit per month': '{{amount}} de crédit API par mois',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      'Utilisez les modèles Claude disponibles aux tarifs MyClaude. Le crédit restant expire à la fin de la période mensuelle.',
    'Model pricing': 'Tarifs des modèles',
    'Compare model prices': 'Comparer les tarifs',
    'Pay as you go': 'Facturation à l’usage',
    'Compare input and output costs per million tokens.':
      'Comparez les coûts d’entrée et de sortie par million de tokens.',
    'Get an API key': 'Obtenir une clé API',
    'Anthropic list price': 'Tarif Anthropic',
    '50% off': '−50 %',
    '{{currency}} per million tokens': '{{currency}} par million de tokens',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      'Conversion indicative · 1 USD = {{rate}} CNY',
    'Official pricing': 'Tarifs officiels',
    'Original API guarantee': 'Garantie API d’origine',
    'Powered by the official Anthropic API': 'API officielle d’Anthropic',
    'Authentic models': 'Modèles authentiques',
    'No substitutions or downgrades': 'Sans remplacement ni déclassement',
    '100× compensation': 'Indemnisation ×100',
    'For confirmed model impersonation': 'En cas de substitution avérée',
    'Subscription plans': 'Abonnements',
    'Light use': 'Usage léger',
    'Occasional use with smaller requests.':
      'Pour des besoins ponctuels et des requêtes courtes.',
    'Frequent use': 'Usage fréquent',
    'Regular use with more requests throughout the day.':
      'Pour des requêtes régulières tout au long de la journée.',
    'Intensive use': 'Usage intensif',
    'Extended use with larger requests.':
      'Pour des sessions longues et des requêtes volumineuses.',
    'Choose {{plan}}': 'Choisir {{plan}}',
    'Payment methods': 'Moyens de paiement',
    'Integration guide': 'Guide d’intégration',
    'Service status': 'État du service',
    'Claude API service': 'Service API Claude',
    'Contact support': 'Contacter l’assistance',
  },
  ru: {
    Recommended: 'Рекомендуем',
    'USD / month': 'USD / месяц',
    '{{amount}} in API credit per month': '{{amount}} на API в месяц',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      'Используйте доступные модели Claude по тарифам MyClaude. Остаток сгорает в конце месячного периода.',
    'Model pricing': 'Цены моделей',
    'Compare model prices': 'Сравнение цен',
    'Pay as you go': 'Оплата по факту',
    'Compare input and output costs per million tokens.':
      'Сравните стоимость входных и выходных токенов за миллион.',
    'Get an API key': 'Получить ключ API',
    'Anthropic list price': 'Цена Anthropic',
    '50% off': 'Скидка 50%',
    '{{currency}} per million tokens': '{{currency}} за миллион токенов',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      'Примерный курс · 1 USD = {{rate}} CNY',
    'Official pricing': 'Официальные тарифы',
    'Original API guarantee': 'Гарантия оригинального API',
    'Powered by the official Anthropic API': 'Официальный API Anthropic',
    'Authentic models': 'Подлинные модели',
    'No substitutions or downgrades': 'Без подмены или понижения',
    '100× compensation': 'Компенсация ×100',
    'For confirmed model impersonation': 'При подтверждённой подмене модели',
    'Subscription plans': 'Подписки',
    'Light use': 'Редкое использование',
    'Occasional use with smaller requests.': 'Для редких и небольших запросов.',
    'Frequent use': 'Частое использование',
    'Regular use with more requests throughout the day.':
      'Для регулярных запросов в течение дня.',
    'Intensive use': 'Интенсивное использование',
    'Extended use with larger requests.':
      'Для долгих сессий и больших запросов.',
    'Choose {{plan}}': 'Выбрать {{plan}}',
    'Payment methods': 'Способы оплаты',
    'Integration guide': 'Руководство по подключению',
    'Service status': 'Статус сервиса',
    'Claude API service': 'Сервис Claude API',
    'Contact support': 'Связаться с поддержкой',
  },
  ja: {
    Recommended: 'おすすめ',
    'USD / month': 'USD / 月',
    '{{amount}} in API credit per month': '毎月 {{amount}} の API クレジット',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      '利用可能な Claude モデルを MyClaude の料金で使えます。未使用分は月間利用期間の終了時に失効します。',
    'Model pricing': 'モデル料金',
    'Compare model prices': 'モデル料金の比較',
    'Pay as you go': '従量課金',
    'Compare input and output costs per million tokens.':
      '100万トークンあたりの入力と出力の料金を比較。',
    'Get an API key': 'API キーを取得',
    'Anthropic list price': 'Anthropic 公式料金',
    '50% off': '50% オフ',
    '{{currency}} per million tokens': '100万トークンあたり {{currency}}',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      '参考換算 · 1 USD = {{rate}} CNY',
    'Official pricing': '公式料金',
    'Original API guarantee': '公式 API 保証',
    'Powered by the official Anthropic API': 'Anthropic 公式 API に接続',
    'Authentic models': '正規モデル',
    'No substitutions or downgrades': 'モデルの差し替えや格下げなし',
    '100× compensation': '100倍補償',
    'For confirmed model impersonation': 'モデルの偽装が確認された場合',
    'Subscription plans': 'サブスクリプション',
    'Light use': 'ライト利用',
    'Occasional use with smaller requests.': 'ときどき、少しずつ使う方に。',
    'Frequent use': '頻繁な利用',
    'Regular use with more requests throughout the day.':
      '日常的に何度も使う方に。',
    'Intensive use': '集中的な利用',
    'Extended use with larger requests.': '長時間の利用や大きなリクエストに。',
    'Choose {{plan}}': '{{plan}} を選択',
    'Payment methods': 'お支払い方法',
    'Integration guide': '導入ガイド',
    'Service status': 'サービス稼働状況',
    'Claude API service': 'Claude API サービス',
    'Contact support': 'サポートに問い合わせる',
  },
  vi: {
    Recommended: 'Đề xuất',
    'USD / month': 'USD / tháng',
    '{{amount}} in API credit per month': '{{amount}} tín dụng API mỗi tháng',
    'Use any available Claude model at MyClaude rates. Unused credit expires at the end of the month.':
      'Dùng các mô hình Claude hiện có theo giá MyClaude. Tín dụng còn lại hết hạn vào cuối kỳ tháng.',
    'Model pricing': 'Giá mô hình',
    'Compare model prices': 'So sánh giá mô hình',
    'Pay as you go': 'Trả theo mức sử dụng',
    'Compare input and output costs per million tokens.':
      'So sánh chi phí đầu vào và đầu ra trên mỗi triệu token.',
    'Get an API key': 'Lấy khóa API',
    'Anthropic list price': 'Giá chính thức Anthropic',
    '50% off': 'Giảm 50%',
    '{{currency}} per million tokens': '{{currency}} / triệu token',
    'Approximate conversion · 1 USD = {{rate}} CNY':
      'Quy đổi tham khảo · 1 USD = {{rate}} CNY',
    'Official pricing': 'Giá chính thức',
    'Original API guarantee': 'Bảo đảm API chính thức',
    'Powered by the official Anthropic API':
      'Kết nối API chính thức của Anthropic',
    'Authentic models': 'Mô hình chính hãng',
    'No substitutions or downgrades': 'Không thay thế hoặc hạ cấp mô hình',
    '100× compensation': 'Bồi thường gấp 100',
    'For confirmed model impersonation': 'Khi xác nhận mô hình bị giả mạo',
    'Subscription plans': 'Gói đăng ký',
    'Light use': 'Dùng ít',
    'Occasional use with smaller requests.':
      'Phù hợp khi dùng thỉnh thoảng với yêu cầu nhỏ.',
    'Frequent use': 'Dùng thường xuyên',
    'Regular use with more requests throughout the day.':
      'Phù hợp khi dùng thường xuyên trong ngày.',
    'Intensive use': 'Dùng nhiều',
    'Extended use with larger requests.':
      'Phù hợp khi dùng lâu và gửi yêu cầu lớn.',
    'Choose {{plan}}': 'Chọn {{plan}}',
    'Payment methods': 'Phương thức thanh toán',
    'Integration guide': 'Hướng dẫn tích hợp',
    'Service status': 'Trạng thái dịch vụ',
    'Claude API service': 'Dịch vụ API Claude',
    'Contact support': 'Liên hệ hỗ trợ',
  },
}

export function registerHomeTranslations(instance: i18n) {
  for (const [language, messages] of Object.entries(translations)) {
    instance.addResourceBundle(language, HOME_NS, messages)
  }
}
