/* 专属小厨房 · 单机版
   数据全部存在浏览器 localStorage，换设备/清缓存会丢。 */

const KEY = 'diancai_v1';
const DATA_VER = 8;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const money = n => Number(n || 0).toFixed(2).replace(/\.00$/, '');

/* ---------------- 日期 ---------------- */
function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return todayStr(d);
}
function daysLeft(dateStr) {
  const a = new Date(todayStr() + 'T00:00:00');
  const b = new Date(dateStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}
function mealNow() {
  const h = new Date().getHours();
  if (h < 9) return '早餐';
  if (h < 14) return '午餐';
  if (h < 17) return '下午茶';
  if (h < 21) return '晚餐';
  return '夜宵';
}
function prettyDate(s) {
  const d = new Date(s + 'T00:00:00');
  const w = '日一二三四五六'[d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 周${w}`;
}

/* ---------------- 默认数据 ---------------- */
const UNITS = ['个', '克', '斤', '杯', '勺', '罐', '张', '块', '袋', '瓶', '把'];
const EMOJIS = ['🍲','🍜','🍗','🍖','🥩','🥬','🥕','🍅','🥔','🍳','🥚','🍚','🍛','🍝','🥣','🥤','🍤','🌶️','🫑','🧄','🥒','🥪','🍞','🥛','🍋','🥟','🌭','🥗','🍎','🍟'];

function defaultState() {
  const t = todayStr();
  return {
    ver: DATA_VER,
    profile: { cookName: '我', foodieName: '晶晶', role: 'foodie' },
    ui: {
      tab: 'order', cat: 'meat', search: '', meal: mealNow(), date: t, manual: false,
      foodieTab: 'orders', basketDate: t, basketMeal: '全天',
      fridge: { stat: 'all', storage: '', cat: '' }
    },
    settings: { notifyExpire: true },
    categories: [
      { id: 'main', name: '主食', emoji: '🍚' },
      { id: 'meat', name: '荤', emoji: '🥩' },
      { id: 'veg',  name: '素', emoji: '🥬' },
      { id: 'egg',  name: '蛋', emoji: '🍳' },
      { id: 'soup', name: '汤', emoji: '🥣' },
      { id: 'drink',name: '喝', emoji: '🥤' },
      { id: 'air',  name: '空气炸锅', emoji: '🍟' },
      { id: 'other',name: '未分类', emoji: '📦' }
    ],
    dishes: [
      /* 主食 */
      { id: 'd1', name: '米饭', cat: 'main', emoji: '🍚', pending: false,
        ingredients: [{ name: '大米', qty: 1, unit: '杯' }],
        steps: '淘米加水（米和水 1:1.2），电煮锅蒸 25 分钟，不用加调料' },
      { id: 'd2', name: '番茄鸡蛋面', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '面条', qty: 1, unit: '把' }, { name: '番茄', qty: 1, unit: '个' }, { name: '鸡蛋', qty: 1, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 锅热倒 1 勺油，番茄切块炒出汁\n2. 加水烧开，下面条煮熟\n3. 淋蛋液搅出蛋花，加半勺盐' },
      { id: 'd3', name: '葱油拌面', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '面条', qty: 1, unit: '把' }, { name: '葱', qty: 1, unit: '根' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 2, unit: '勺' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '1. 葱切段，冷油下锅小火炸到焦黄（约 5 分钟）\n2. 关火，倒 1 勺生抽、半勺白糖，拌成葱油汁\n3. 面条煮熟捞出，淋葱油汁拌开' },
      { id: 'd4', name: '老友粉', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '米粉', qty: 1, unit: '把' }, { name: '酸笋', qty: 1, unit: '把' }, { name: '豆豉', qty: 1, unit: '勺' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '辣椒酱', qty: 1, unit: '勺' }],
        steps: '1. 热油下蒜末、豆豉、酸笋爆香\n2. 加水烧开，加半勺盐\n3. 下米粉煮软，喜欢辣加一勺辣椒酱' },
      { id: 'd5', name: '螺蛳粉（速食）', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '螺蛳粉', qty: 1, unit: '包' }],
        steps: '粉煮软捞出，另起水把料包和红油煮开浇上。调料全在料包里，不用另外加' },
      { id: 'd6', name: '燕麦粥', cat: 'main', emoji: '🥣', pending: false,
        ingredients: [{ name: '燕麦', qty: 1, unit: '杯' }, { name: '牛奶', qty: 1, unit: '盒' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '牛奶小火加热，倒燕麦搅到粘稠，想甜加半勺白糖' },
      { id: 'd7', name: '煮饺子', cat: 'main', emoji: '🥟', pending: false,
        ingredients: [{ name: '速冻饺子', qty: 1, unit: '袋' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '1. 水开下锅，点三次凉水，浮起来就熟\n2. 蘸料：1 勺生抽 + 半勺醋 + 几滴花椒油' },
      /* 荤 */
      { id: 'd8', name: '白切鸡', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡腿', qty: 1, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '葱', qty: 1, unit: '根' }, { name: '盐', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡腿冷水下锅，放 2 片姜、1 根葱段，煮 15 分钟\n2. 捞出泡冰水（肉更紧实）\n3. 蘸料：姜末葱末 + 半勺盐，淋一勺热油，再加 1 勺生抽' },
      { id: 'd9', name: '可乐鸡翅', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡翅', qty: 8, unit: '个' }, { name: '可乐', qty: 1, unit: '罐' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡翅两面划刀，冷水下锅加姜片、1 勺料酒焯 3 分钟\n2. 热油煎到两面金黄\n3. 倒一罐可乐、1 勺生抽、半勺盐，小火收汁 10 分钟' },
      { id: 'd10', name: '啤酒鱼', cat: 'meat', emoji: '🐟', pending: false,
        ingredients: [{ name: '鱼', qty: 1, unit: '条' }, { name: '啤酒', qty: 1, unit: '罐' }, { name: '番茄', qty: 1, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鱼擦干水分，热油两面煎定型\n2. 下姜片、番茄块炒软，倒一罐啤酒\n3. 加 1 勺生抽、半勺盐，焖 10 分钟收汁' },
      { id: 'd11', name: '荔浦芋头蒸肉', cat: 'meat', emoji: '🍖', pending: false,
        ingredients: [{ name: '芋头', qty: 1, unit: '个' }, { name: '五花肉', qty: 200, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 五花肉切薄片，用 1 勺生抽、1 勺料酒、半勺盐、姜丝腌 15 分钟\n2. 芋头切块铺碗底，肉片码上面\n3. 水开上锅蒸 30 分钟' },
      { id: 'd12', name: '酸笋炒肉', cat: 'meat', emoji: '🌶️', pending: false,
        ingredients: [{ name: '酸笋', qty: 1, unit: '把' }, { name: '猪肉', qty: 200, unit: '克' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '辣椒酱', qty: 1, unit: '勺' }],
        steps: '1. 肉片直接下锅煸出油（不用另外放油）\n2. 下酸笋、蒜末炒香\n3. 加 1 勺生抽、半勺盐，喜欢辣加一勺辣椒酱' },
      { id: 'd13', name: '柠檬鸭', cat: 'meat', emoji: '🦆', pending: false,
        ingredients: [{ name: '鸭肉', qty: 500, unit: '克' }, { name: '柠檬', qty: 2, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸭肉冷水下锅，加姜片和 1 勺料酒焯水\n2. 热油下姜蒜炒香，倒鸭肉翻炒到表皮收紧\n3. 加 1 勺生抽、半勺盐，放柠檬片焖 20 分钟' },
      { id: 'd14', name: '番茄炖牛腩', cat: 'meat', emoji: '🍲', pending: false,
        ingredients: [{ name: '牛腩', qty: 300, unit: '克' }, { name: '番茄', qty: 2, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 牛腩冷水下锅，加姜片、1 勺料酒焯水捞出\n2. 少油把番茄炒出汁\n3. 倒牛腩，加水没过，加 1 勺生抽，炖 40 分钟，最后加半勺盐' },
      /* 素 */
      { id: 'd15', name: '凉拌黄瓜', cat: 'veg', emoji: '🥒', pending: false,
        ingredients: [{ name: '黄瓜', qty: 1, unit: '根' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '黄瓜拍裂切段，加 1 勺生抽、1 勺醋、半勺盐、蒜末、几滴花椒油，拌 5 分钟' },
      { id: 'd16', name: '清炒时蔬', cat: 'veg', emoji: '🥬', pending: false,
        ingredients: [{ name: '青菜', qty: 1, unit: '把' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '热油爆香蒜片，下青菜大火快炒 1 分钟，加半勺盐出锅' },
      { id: 'd17', name: '酸辣土豆丝', cat: 'veg', emoji: '🥔', pending: false,
        ingredients: [{ name: '土豆', qty: 1, unit: '个' }, { name: '干辣椒', qty: 3, unit: '个' }, { name: '醋', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 土豆切丝泡水 5 分钟去淀粉，沥干\n2. 热油下干辣椒爆香\n3. 下土豆丝大火炒 2 分钟，沿锅边淋 1 勺醋，加半勺盐' },
      { id: 'd18', name: '醋溜白菜', cat: 'veg', emoji: '🥬', pending: false,
        ingredients: [{ name: '白菜', qty: 1, unit: '棵' }, { name: '醋', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '白糖', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 热油先炒白菜帮 2 分钟\n2. 下菜叶，加 1 勺醋、半勺白糖、1 勺生抽、半勺盐\n3. 大火翻匀出锅' },
      { id: 'd19', name: '蒜蓉娃娃菜', cat: 'veg', emoji: '🥬', pending: false,
        ingredients: [{ name: '娃娃菜', qty: 1, unit: '棵' }, { name: '蒜', qty: 3, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 蒜末用一勺热油激出香味\n2. 娃娃菜切条摆盘，浇上蒜末、1 勺生抽、半勺盐\n3. 水开蒸 8 分钟' },
      { id: 'd20', name: '凉拌木耳', cat: 'veg', emoji: '🥗', pending: false,
        ingredients: [{ name: '木耳', qty: 1, unit: '把' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '醋', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '木耳泡发，水开焯 2 分钟捞出，加 1 勺醋、1 勺生抽、蒜末、半勺盐拌开' },
      { id: 'd21', name: '蒸南瓜', cat: 'veg', emoji: '🎃', pending: false,
        ingredients: [{ name: '南瓜', qty: 1, unit: '块' }],
        steps: '南瓜切块蒸 15 分钟，本身够甜，不用放调料' },
      /* 蛋 */
      { id: 'd22', name: '水煮蛋', cat: 'egg', emoji: '🥚', pending: false,
        ingredients: [{ name: '鸡蛋', qty: 1, unit: '个' }],
        steps: '冷水下锅，水开算起 8 分钟，捞出过凉水好剥，不用放调料' },
      { id: 'd23', name: '蒸鸡蛋羹', cat: 'egg', emoji: '🍳', pending: false,
        ingredients: [{ name: '鸡蛋', qty: 2, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 2 个蛋加半勺盐打散\n2. 加 1.5 倍温水搅匀，撇掉浮沫，盖保鲜膜扎几个孔\n3. 蒸 10 分钟，出锅淋 1 勺生抽、几滴油' },
      { id: 'd24', name: '番茄炒蛋', cat: 'egg', emoji: '🍅', pending: false,
        ingredients: [{ name: '番茄', qty: 2, unit: '个' }, { name: '鸡蛋', qty: 3, unit: '个' }, { name: '食用油', qty: 2, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '1. 蛋液加半勺盐打散，热油炒到半凝固盛出\n2. 番茄切块下锅炒出汁，加半勺白糖压酸味\n3. 倒回鸡蛋翻匀，尝一下咸淡再补盐' },
      { id: 'd25', name: '韭菜炒蛋', cat: 'egg', emoji: '🥚', pending: false,
        ingredients: [{ name: '韭菜', qty: 1, unit: '把' }, { name: '鸡蛋', qty: 2, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 蛋液加半勺盐打散，热油炒散盛出\n2. 韭菜切段下锅大火炒 30 秒\n3. 倒回鸡蛋拌匀就出锅' },
      { id: 'd26', name: '荷包蛋', cat: 'egg', emoji: '🍳', pending: false,
        ingredients: [{ name: '鸡蛋', qty: 1, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '油热磕蛋，小火煎到底边焦脆，表面撒几粒盐' },
      /* 汤 */
      { id: 'd27', name: '紫菜蛋花汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '紫菜', qty: 1, unit: '张' }, { name: '鸡蛋', qty: 1, unit: '个' }, { name: '葱', qty: 1, unit: '根' }, { name: '盐', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '1. 水开撕碎紫菜下锅\n2. 淋蛋液搅出蛋花\n3. 加半勺盐、几滴花椒油，撒葱花' },
      { id: 'd28', name: '白菜豆腐汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '白菜', qty: 1, unit: '棵' }, { name: '豆腐', qty: 1, unit: '块' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '水开下白菜和豆腐块，煮 5 分钟，加半勺盐，滴几滴油' },
      { id: 'd29', name: '番茄蛋汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '番茄', qty: 1, unit: '个' }, { name: '鸡蛋', qty: 1, unit: '个' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '番茄切块少油炒出汁，加水烧开，淋蛋液，加半勺盐' },
      { id: 'd30', name: '玉米排骨汤', cat: 'soup', emoji: '🌽', pending: false,
        ingredients: [{ name: '玉米', qty: 1, unit: '根' }, { name: '排骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 排骨冷水下锅焯，加姜片和 1 勺料酒\n2. 加玉米段，水开后小火炖 40 分钟\n3. 出锅前加 1 勺盐' },
      { id: 'd31', name: '冬瓜排骨汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '冬瓜', qty: 1, unit: '块' }, { name: '排骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 排骨焯水，加姜片和 1 勺料酒，炖 30 分钟\n2. 最后下冬瓜煮 10 分钟\n3. 加 1 勺盐' },
      { id: 'd32', name: '白萝卜猪骨汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '白萝卜', qty: 1, unit: '个' }, { name: '猪骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '猪骨冷水焯水（加姜片、1 勺料酒），加萝卜块炖 40 分钟，出锅加 1 勺盐' },
      /* 喝 */
      { id: 'd33', name: '热牛奶', cat: 'drink', emoji: '🥛', pending: false,
        ingredients: [{ name: '牛奶', qty: 1, unit: '盒' }],
        steps: '倒进锅小火加热，冒热气就关，别烧开（会起奶皮），不用放调料' },
      { id: 'd34', name: '柠檬水', cat: 'drink', emoji: '🍋', pending: false,
        ingredients: [{ name: '柠檬', qty: 1, unit: '个' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '柠檬切片，温水泡 10 分钟，怕酸加半勺蜂蜜' },
      { id: 'd35', name: '红豆沙', cat: 'drink', emoji: '🫘', pending: false,
        ingredients: [{ name: '红豆', qty: 1, unit: '杯' }, { name: '冰糖', qty: 30, unit: '克' }],
        steps: '红豆提前泡 4 小时，加水煮到开花（约 40 分钟），加 30 克冰糖' },
      { id: 'd36', name: '绿豆沙', cat: 'drink', emoji: '🫘', pending: false,
        ingredients: [{ name: '绿豆', qty: 1, unit: '杯' }, { name: '冰糖', qty: 30, unit: '克' }],
        steps: '绿豆煮到开花，加 30 克冰糖，放凉更好喝' },
      { id: 'd37', name: '蜂蜜柚子茶', cat: 'drink', emoji: '🍯', pending: false,
        ingredients: [{ name: '柚子', qty: 1, unit: '个' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '柚子肉撕碎，加 1 勺蜂蜜拌，温水冲开' },
      { id: 'd38', name: '煮奶茶', cat: 'drink', emoji: '☕', pending: false,
        ingredients: [{ name: '红茶包', qty: 1, unit: '个' }, { name: '牛奶', qty: 1, unit: '盒' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '红茶包用少量热水泡浓 3 分钟，倒牛奶小火加热，想甜加半勺白糖' },
      /* 空气炸锅 */
      { id: 'd39', name: '烤鸡翅', cat: 'air', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡翅', qty: 6, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '蒜', qty: 2, unit: '瓣' }],
        steps: '1. 鸡翅划刀，用 1 勺生抽、1 勺料酒、半勺盐、蒜末腌 30 分钟\n2. 180℃ 烤 15 分钟\n3. 翻面刷点腌料，再烤 8 分钟' },
      { id: 'd40', name: '炸薯条', cat: 'air', emoji: '🍟', pending: false,
        ingredients: [{ name: '土豆', qty: 1, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '土豆切条泡水 10 分钟沥干，拌 1 勺油、半勺盐，200℃ 烤 18 分钟' },
      { id: 'd41', name: '烤火腿肠', cat: 'air', emoji: '🌭', pending: false,
        ingredients: [{ name: '火腿肠', qty: 2, unit: '个' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '表面划花刀，180℃ 烤 8 分钟，出炉撒椒盐粉' },
      { id: 'd42', name: '烤面包片', cat: 'air', emoji: '🍞', pending: false,
        ingredients: [{ name: '面包', qty: 2, unit: '片' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '180℃ 烤 4 分钟，出炉抹蜂蜜或果酱' },
      { id: 'd43', name: '烤玉米', cat: 'air', emoji: '🌽', pending: false,
        ingredients: [{ name: '玉米', qty: 1, unit: '根' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '玉米刷一层油，撒点盐，200℃ 烤 15 分钟' },
      { id: 'd44', name: '烤紫薯', cat: 'air', emoji: '🍠', pending: false,
        ingredients: [{ name: '紫薯', qty: 1, unit: '个' }],
        steps: '200℃ 烤 25 分钟，筷子能戳透就好，不用放调料' },
      { id: 'd45', name: '烤豆腐', cat: 'air', emoji: '🍢', pending: false,
        ingredients: [{ name: '豆腐', qty: 1, unit: '块' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '孜然粉', qty: 1, unit: '瓶' }],
        steps: '豆腐切块，刷 1 勺生抽 + 1 勺油，200℃ 烤 15 分钟，出炉撒孜然粉' },
      { id: 'd46', name: '烤时蔬', cat: 'air', emoji: '🥬', pending: false,
        ingredients: [{ name: '青菜', qty: 1, unit: '把' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '青菜拌 1 勺油、半勺盐，200℃ 烤 12 分钟' },
      /* 按 11-15 采购的食材加的 */
      { id: 'd47', name: '云吞面', cat: 'main', emoji: '🥟', pending: false,
        ingredients: [{ name: '云吞', qty: 1, unit: '袋' }, { name: '面条', qty: 1, unit: '把' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '1. 水开先下云吞煮 5 分钟\n2. 再下面条煮 3 分钟\n3. 碗里放 1 勺生抽、半勺盐、几滴花椒油，舀一勺汤冲开\n4. 面和云吞捞进碗里，撒点椒盐粉' },
      { id: 'd50', name: '羊肉卷涮酸菜', cat: 'meat', emoji: '🍲', pending: false,
        ingredients: [{ name: '羊肉卷', qty: 1, unit: '袋' }, { name: '酸菜', qty: 1, unit: '包' }, { name: '白胡椒粉', qty: 1, unit: '瓶' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 水开下酸菜煮 3 分钟出味\n2. 羊肉卷下锅，一烫变色就捞（久了会老）\n3. 撒白胡椒粉；酸菜本身有咸味，尝过再决定加不加盐' },
      { id: 'd51', name: '虾仁炒蛋', cat: 'egg', emoji: '🍤', pending: false,
        ingredients: [{ name: '虾仁', qty: 1, unit: '袋' }, { name: '鸡蛋', qty: 2, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '1. 虾仁用椒盐粉抓 5 分钟\n2. 蛋液加半勺盐，热油炒散盛出\n3. 虾仁炒到变红，倒回鸡蛋拌匀' },
      { id: 'd52', name: '清炒鸡枞菇', cat: 'veg', emoji: '🍄', pending: false,
        ingredients: [{ name: '鸡枞菇', qty: 1, unit: '盒' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '菇撕条，油热下锅大火炒 3 分钟，加半勺盐、撒点椒盐粉' },
      { id: 'd53', name: '凉拌沙葛', cat: 'veg', emoji: '🥗', pending: false,
        ingredients: [{ name: '沙葛', qty: 1, unit: '个' }, { name: '辣椒酱', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }],
        steps: '沙葛去皮切细丝，加 1 勺辣椒酱、1 勺生抽、半勺醋拌开，冰一会更脆' },
      { id: 'd54', name: '豆干炒辣椒', cat: 'veg', emoji: '🌶️', pending: false,
        ingredients: [{ name: '豆干', qty: 1, unit: '块' }, { name: '辣椒酱', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }],
        steps: '1. 豆干切片，少油煎到两面微黄\n2. 下 1 勺辣椒酱、1 勺生抽炒匀' },
      { id: 'd55', name: '潮汕牛肉丸汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '牛肉丸', qty: 1, unit: '袋' }, { name: '白胡椒粉', qty: 1, unit: '瓶' }, { name: '盐', qty: 1, unit: '勺' }, { name: '葱', qty: 1, unit: '根' }],
        steps: '水开下丸子煮 5 分钟到浮起来，加半勺盐，撒白胡椒粉和葱花' },
      { id: 'd56', name: '椰汁汤圆', cat: 'drink', emoji: '🍡', pending: false,
        ingredients: [{ name: '汤圆', qty: 1, unit: '袋' }, { name: '椰汁', qty: 1, unit: '瓶' }],
        steps: '汤圆煮到浮起来，捞进碗里浇椰汁，不用另外加糖' },
      { id: 'd57', name: '酸奶水果杯', cat: 'drink', emoji: '🍎', pending: false,
        ingredients: [{ name: '酸奶', qty: 1, unit: '袋' }, { name: '苹果', qty: 1, unit: '个' }, { name: '香蕉', qty: 1, unit: '把' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '苹果香蕉切块，浇上酸奶，想甜再淋半勺蜂蜜' },
      { id: 'd58', name: '烤蜜薯', cat: 'air', emoji: '🍠', pending: false,
        ingredients: [{ name: '蜜薯', qty: 1, unit: '个' }],
        steps: '200℃ 烤 25 分钟，筷子能戳透就行，不用放调料' },
      { id: 'd59', name: '烤鸡枞菇', cat: 'air', emoji: '🍄', pending: false,
        ingredients: [{ name: '鸡枞菇', qty: 1, unit: '盒' }, { name: '孜然粉', qty: 1, unit: '瓶' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '菇撕条刷一层油，撒孜然粉和一点盐，190℃ 烤 12 分钟' },
      { id: 'd60', name: '烤南瓜馒头片', cat: 'air', emoji: '🍞', pending: false,
        ingredients: [{ name: '南瓜馒头', qty: 1, unit: '袋' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '馒头切片，两面刷薄薄一层油，180℃ 烤 6 分钟，外脆里软' },
      { id: 'd61', name: '烤土豆角', cat: 'air', emoji: '🥔', pending: false,
        ingredients: [{ name: '土豆', qty: 1, unit: '个' }, { name: '孜然粉', qty: 1, unit: '瓶' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '土豆切角，拌 1 勺油、孜然粉、半勺盐，200℃ 烤 18 分钟' }
    ],
    cart: [],
    orders: [],
    basket: [],
    /* 按 2026-11-15 晚超市小票录的实际食材 */
    fridge: [
      { id: 'f1', name: '大米', qty: 3, unit: '杯', storage: '常温', cat: '主食', expire: '' },
      { id: 'f2', name: '面条', qty: 2, unit: '把', storage: '常温', cat: '主食', expire: '' },
      { id: 'f3', name: '速冻饺子', qty: 1, unit: '袋', storage: '冷冻', cat: '主食', expire: addDays(t, 90) },
      { id: 'f6', name: '云吞', qty: 1, unit: '袋', storage: '冷冻', cat: '主食', expire: addDays(t, 90) },
      { id: 'f7', name: '汤圆', qty: 1, unit: '袋', storage: '冷冻', cat: '主食', expire: addDays(t, 90) },
      { id: 'f8', name: '南瓜馒头', qty: 1, unit: '袋', storage: '冷冻', cat: '主食', expire: addDays(t, 90) },
      { id: 'f9', name: '鸡蛋', qty: 10, unit: '个', storage: '冷藏', cat: '肉禽蛋', expire: addDays(t, 20) },
      { id: 'f10', name: '牛肉丸', qty: 1, unit: '袋', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
      { id: 'f11', name: '羊肉卷', qty: 1, unit: '袋', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
      { id: 'f12', name: '虾仁', qty: 1, unit: '袋', storage: '冷冻', cat: '海鲜', expire: addDays(t, 90) },
      { id: 'f13', name: '番茄', qty: 3, unit: '个', storage: '冷藏', cat: '瓜豆', expire: addDays(t, 7) },
      { id: 'f14', name: '土豆', qty: 3, unit: '个', storage: '常温', cat: '瓜豆', expire: '' },
      { id: 'f15', name: '南瓜', qty: 2, unit: '块', storage: '常温', cat: '瓜豆', expire: '' },
      { id: 'f16', name: '玉米', qty: 2, unit: '根', storage: '冷藏', cat: '瓜豆', expire: addDays(t, 5) },
      { id: 'f17', name: '蜜薯', qty: 3, unit: '个', storage: '常温', cat: '瓜豆', expire: '' },
      { id: 'f18', name: '沙葛', qty: 1, unit: '个', storage: '常温', cat: '瓜豆', expire: '' },
      { id: 'f19', name: '鸡枞菇', qty: 1, unit: '盒', storage: '冷藏', cat: '配菜', expire: addDays(t, 5) },
      { id: 'f20', name: '酸菜', qty: 1, unit: '包', storage: '常温', cat: '配菜', expire: addDays(t, 15) },
      { id: 'f21', name: '豆干', qty: 1, unit: '块', storage: '冷藏', cat: '配菜', expire: addDays(t, 6) },
      { id: 'f22', name: '柿子', qty: 3, unit: '个', storage: '常温', cat: '果饮', expire: addDays(t, 7) },
      { id: 'f23', name: '苹果', qty: 2, unit: '个', storage: '常温', cat: '果饮', expire: addDays(t, 20) },
      { id: 'f24', name: '香蕉', qty: 1, unit: '把', storage: '常温', cat: '果饮', expire: addDays(t, 5) },
      { id: 'f25', name: '维他奶', qty: 6, unit: '盒', storage: '常温', cat: '果饮', expire: addDays(t, 180) },
      { id: 'f26', name: '酸奶', qty: 8, unit: '袋', storage: '冷藏', cat: '果饮', expire: addDays(t, 20) },
      { id: 'f27', name: '椰汁', qty: 3, unit: '瓶', storage: '常温', cat: '果饮', expire: addDays(t, 180) },
      { id: 'f28', name: '食用油', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f41', name: '花椒油', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f29', name: '辣椒酱', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f30', name: '孜然粉', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f31', name: '椒盐粉', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f32', name: '白胡椒粉', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      /* 按 2026-11-14 拼多多买的海天宿舍调料 9 件套补上 */
      { id: 'f33', name: '生抽', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f34', name: '醋', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f35', name: '料酒', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f36', name: '盐', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f37', name: '淀粉', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f38', name: '蚝油', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f39', name: '花椒粉', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      { id: 'f40', name: '鸡精', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' }
    ],
    requests: []
  };
}

/* ---------------- 存取 ---------------- */
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const d = defaultState();
      const m = { ...d, ...s, ui: { ...d.ui, ...(s.ui || {}) }, profile: { ...d.profile, ...(s.profile || {}) }, settings: { ...d.settings, ...(s.settings || {}) } };
      if ((s.ver || 1) < DATA_VER) {
        const v = s.ver || 1;
        const valid = new Set(d.categories.map(c => c.id));
        const mine = (s.dishes || []).filter(x => !/^d\d+$/.test(x.id))
          .map(x => valid.has(x.cat) ? x : { ...x, cat: 'other' });
        m.dishes = [...d.dishes, ...mine];
        m.categories = d.categories;
        m.cart = [];
        m.orders = (s.orders || []).map(o => ({
          ...o, items: (o.items || []).map(it => ({ ...it, dishId: '' }))
        }));
        m.ver = DATA_VER;
        if (!valid.has(m.ui.cat)) m.ui.cat = d.ui.cat;

        // 冰箱版本：v4 起按 11-15 超市小票的真实食材重置，更早的版本先合并掉 stock
        if (v < 3) {
          m.fridge = v < 2 ? d.fridge.slice() : (s.fridge || []).slice();
          const mergeIn = (name, qty, unit, extra) => {
            const t = m.fridge.find(x => x.name === name);
            if (t) t.qty = Number(t.qty) + Number(qty);
            else m.fridge.push({ id: uid(), name, qty: Number(qty), unit, storage: '常温', cat: '', expire: '', ...(extra || {}) });
          };
          if (v >= 2) (s.stock || []).forEach(st => mergeIn(st.name, st.qty, st.unit));
          delete m.stock;
        }
        if (v < 4) {
          m.fridge = d.fridge.slice();
          mine.forEach(x => (x.ingredients || []).forEach(i => {
            if (!m.fridge.some(f => f.name === i.name)) {
              m.fridge.push({ id: uid(), name: i.name, qty: i.qty, unit: i.unit, storage: '常温', cat: '', expire: '' });
            }
          }));
          m.basket = [];
        }
        // v5：补上拼多多买的海天调料，不动她已经改过的数量
        if (v < 5) {
          ['生抽', '醋', '料酒', '盐', '淀粉', '蚝油', '花椒粉', '鸡精'].forEach(name => {
            if (!m.fridge.some(x => x.name === name)) {
              m.fridge.push({ id: uid(), name, qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' });
            }
          });
        }
        // v6：油分食用油/花椒油、调料不记数量、酸菜和苹果常温、去掉吃完的速食面
        if (v < 6) {
          m.fridge = m.fridge.filter(x => !['辛拉面', '过桥米线'].includes(x.name));
          m.fridge.forEach(x => {
            if (x.name === '酸菜' || x.name === '苹果') x.storage = '常温';
            if (x.cat === '配菜') { x.unit = ''; x.qty = 1; }
          });
          if (!m.fridge.some(x => x.name === '食用油')) {
            m.fridge.push({ id: uid(), name: '食用油', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' });
          }
          if (!m.fridge.some(x => x.name === '花椒油')) {
            m.fridge.push({ id: uid(), name: '花椒油', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' });
          }
          m.fridge = m.fridge.filter(x => x.name !== '油');
          m.dishes.forEach(d => (d.ingredients || []).forEach(i => { if (i.name === '油') i.name = '食用油'; }));
        }
        // v8：之前的订单和菜篮都是试验，清掉重新开始
        if (v < 8) {
          m.orders = [];
          m.basket = [];
        }
      }
      return m;
    }
  } catch (e) { /* 坏数据就重来 */ }
  return defaultState();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('浏览器存储满了'); }
}
const findDish = id => state.dishes.find(d => d.id === id);

/* ---------------- 库存判断（冰箱即库存） ---------------- */
function findIng(name) {
  return state.fridge.find(x => x.name === name);
}
/* 保质期按买回来那天算，天数按食材分：冷冻统一 90 天，其余照常见保鲜期 */
const SHELF_DAYS = {
  '鸡蛋': 21, '酸奶': 21,
  '维他奶': 180, '椰汁': 180, '大米': 180, '面条': 180, '酸菜': 180,
  '香蕉': 5, '柿子': 7, '番茄': 5, '玉米': 5, '鸡枞菇': 5,
  '苹果': 14, '豆干': 7,
  '土豆': 30, '南瓜': 30, '蜜薯': 30, '沙葛': 30
};
function shelfLife(item) {
  const { name = '', storage = '常温', cat = '' } = item || {};
  if (storage === '冷冻') return 90;
  if (SHELF_DAYS[name]) return SHELF_DAYS[name];
  if (cat === '海鲜') return 1;
  if (cat === '肉禽蛋') return 2;
  if (cat === '叶菜') return 3;
  if (cat === '瓜豆') return storage === '冷藏' ? 5 : 7;
  if (cat === '果饮') return storage === '冷藏' ? 7 : 5;
  if (cat === '主食') return 180;
  if (cat === '配菜') return storage === '冷藏' ? 7 : 60;
  return storage === '冷藏' ? 5 : 15;
}
/* 冰箱只记有没有，所以「补进来」就是确保这一行在 */
function addIng(name, extra) {
  if (!findIng(name)) {
    state.fridge.push({ id: uid(), name, qty: 1, unit: '', storage: '常温', cat: '', expire: '', ...(extra || {}) });
  }
}
/* 吃完了：移出冰箱，进菜篮的待补清单（记住原来放冰箱哪一格、哪个分类） */
function fridgeEaten(id) {
  const x = state.fridge.find(s => s.id === id);
  if (!x) return;
  state.fridge = state.fridge.filter(s => s.id !== id);
  state.basket.push({
    id: uid(), name: x.name, qty: 1, unit: '', price: 0,
    storage: x.storage || '常温', cat: x.cat || '',
    restock: true, bought: false, date: todayStr(), meal: '全天'
  });
  save(); render(); toast(`「${x.name}」进菜篮了`);
}
/* 买回来了：从菜篮拿回去，放回原来的格子和分类，保质期从今天重新算 */
function basketBack(id) {
  const b = state.basket.find(x => x.id === id);
  if (!b) return;
  const storage = b.storage || '常温';
  state.basket = state.basket.filter(x => x.id !== id);
  addIng(b.name, { storage, cat: b.cat || '', expire: addDays(todayStr(), shelfLife({ name: b.name, storage, cat: b.cat })) });
  save(); render(); toast(`「${b.name}」放回冰箱了`);
}
/* 冰箱只记「有没有」，不记数量：有这个食材就不算缺 */
function dishMiss(d) {
  const miss = [];
  (d.ingredients || []).forEach(ing => {
    if (!findIng(ing.name)) miss.push({ name: ing.name, need: ing.qty, unit: ing.unit });
  });
  return miss;
}
/* 只统计「已完成」：单子里剩下的菜全点完成才算一单，取消掉的不算 */
function doneInfo() {
  const done = state.orders.filter(o => {
    const rest = o.items.filter(i => i.status !== 'canceled');
    return rest.length && rest.every(i => i.status === 'done');
  });
  return {
    orders: done.length,
    dishes: state.orders.reduce((n, o) => n + o.items.filter(i => i.status === 'done').length, 0)
  };
}

/* ---------------- 提示 / 弹窗 ---------------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}
function sheet(html) {
  const m = $('#modal');
  m.innerHTML = `<div class="sheet">${html}</div>`;
  m.classList.remove('hidden');
  m.onclick = e => { if (e.target === m) closeSheet(); };
}
function closeSheet() {
  const m = $('#modal');
  m.classList.add('hidden');
  m.innerHTML = '';
}

/* ---------------- 渲染入口 ---------------- */
function render() {
  const tab = state.ui.tab;
  const view = $('#view');
  if (tab === 'order') view.innerHTML = pageOrder();
  else if (tab === 'foodie') view.innerHTML = pageFoodie();
  else if (tab === 'kitchen') view.innerHTML = pageKitchen();
  else view.innerHTML = pageMe();
  renderTabbar();
}

function renderTabbar() {
  const tabs = [
    ['order', '🍽️', '点菜'],
    ['foodie', '📖', '食记'],
    ['kitchen', '👨‍🍳', '厨房'],
    ['me', '🙂', '我']
  ];
  $('#tabbar').innerHTML = tabs.map(([k, ico, name]) =>
    `<button class="${state.ui.tab === k ? 'active' : ''}" data-act="tab" data-v="${k}">
      <span class="ico">${ico}</span><span>${name}</span>
    </button>`).join('');
}

/* ---------------- 点菜页 ---------------- */
function pageOrder() {
  const p = state.profile;
  if (!state.categories.some(c => c.id === state.ui.cat)) state.ui.cat = state.categories[0].id;
  const recent = recentDishes();
  return `
  <div class="hero">
    <div class="kicker">TODAY'S MENU</div>
    <h1>${esc(p.cookName)}的专属小厨房</h1>
    <div class="sub">${esc(p.foodieName)} · ${state.ui.date === todayStr() ? '今天' : state.ui.date} ${esc(state.ui.meal)} · 已做好 ${doneInfo().orders} 单</div>
    <div class="hero-actions">
      <button class="icon-btn" data-act="manage-dishes" title="管理菜品">⚙️</button>
    </div>
  </div>

  <div class="toolrow">
    <div class="search">🔍<input id="dish-search" placeholder="搜索菜名" value="${esc(state.ui.search)}" /></div>
    <button class="pill" data-act="meal-pick">📅 ${state.ui.date.slice(5).replace('-', '/')} ${esc(state.ui.meal)}</button>
  </div>
  <div class="toolrow" style="padding-top:6px">
    <button class="pill gold" data-act="add-dish">＋ 添加菜品</button>
    <button class="pill" data-act="random">🎲 随机点菜</button>
  </div>

  ${recent.length ? `
  <div style="padding:10px 14px 0">
    <div class="muted" style="margin-bottom:6px">最近点单</div>
    <div class="row wrap">
      ${recent.map(d => `<button class="chip" data-act="cart-add" data-v="${d.id}">${d.emoji || '🍲'} ${esc(d.name)} ＋</button>`).join('')}
    </div>
  </div>` : ''}

  <div class="order-body">
    <div class="cats" id="cat-list">${catsHTML()}</div>
    <div class="dishes" id="dish-area">${dishGridHTML()}</div>
  </div>
  ${cartBarHTML()}
  `;
}

function catsHTML() {
  return state.categories.map(c => {
    const n = state.dishes.filter(d => !d.pending && d.cat === c.id).length;
    return `<button class="cat ${state.ui.cat === c.id ? 'active' : ''}" data-act="cat" data-v="${c.id}">
      ${esc(c.name)} <span class="badge">${n || ''}</span>
    </button>`;
  }).join('');
}

function visibleDishes() {
  const q = state.ui.search.trim().toLowerCase();
  return state.dishes.filter(d => {
    if (d.pending) return false;
    if (q) return d.name.toLowerCase().includes(q);
    return d.cat === state.ui.cat;
  });
}

/* 未分类页里的食材池：饮料、水果、调料不算，免得一堆瓶瓶罐罐 */
const NOT_MIXABLE = ['食用油', '花椒油', '辣椒酱', '孜然粉', '椒盐粉', '白胡椒粉',
  '生抽', '醋', '料酒', '盐', '淀粉', '蚝油', '花椒粉', '鸡精', '白糖', '冰糖', '蜂蜜'];
function mixIngredients() {
  return state.fridge.filter(x => x.cat !== '果饮' && !NOT_MIXABLE.includes(x.name));
}
function mixHTML() {
  const list = mixIngredients();
  if (!list.length) return '';
  return `<div class="section-title">🥕 食材混搭（${list.length}）</div>
    <div class="muted" style="padding:0 14px 8px">不照着菜谱来，想拿什么就点什么，凑成一样菜下单</div>
    <div class="row wrap" style="padding:0 14px 12px">
      ${list.map(x => {
        const c = state.cart.find(k => cartKey(k) === 'ing:' + x.name);
        return `<button class="chip ${c ? 'red' : ''}" data-act="mix-add" data-v="${esc(x.name)}">${esc(x.name)}${c ? ` ×${c.qty}` : ' ＋'}</button>`;
      }).join('')}
    </div>`;
}
function dishGridHTML() {
  const list = visibleDishes();
  const cat = state.categories.find(c => c.id === state.ui.cat);
  const isMix = state.ui.cat === 'other' && !state.ui.search.trim();
  if (isMix) {
    return `${list.length ? `<div class="section-title">📦 自己加的菜（${list.length}）</div>
      <div class="grid">${list.map(dishCard).join('')}</div>` : ''}${mixHTML()}`;
  }
  if (!list.length) return `<div class="empty"><span class="big">🍽️</span>这个分类还空着<br>点上方「添加菜品」加一道</div>`;
  return `<div class="section-title">${cat ? cat.emoji + ' ' + esc(cat.name) : '🔍 搜索结果'}（${list.length}）</div>
    <div class="grid">${list.map(dishCard).join('')}</div>`;
}

function dishCard(d) {
  const miss = dishMiss(d);
  const inCart = state.cart.find(c => c.dishId === d.id);
  return `<div class="dish" data-act="dish-open" data-v="${d.id}">
    <div class="face">${d.emoji || '🍲'}</div>
    <div class="name">${esc(d.name)}${inCart ? ` <span class="muted">×${inCart.qty}</span>` : ''}</div>
    ${miss.length
      ? `<div class="warn">冰箱缺 ${esc(miss.map(m => m.name).join('、'))}</div>
         <button class="urge" data-act="urge" data-v="${esc(miss[0].name)}">催进货</button>`
      : `<div class="meta">${(d.ingredients || []).length ? (d.ingredients.length + ' 样食材') : '无需食材'}</div>`}
    <button class="plus" data-act="cart-add" data-v="${d.id}">+</button>
  </div>`;
}

function cartCount() { return state.cart.reduce((n, c) => n + c.qty, 0); }

function cartBarHTML() {
  const n = cartCount();
  return `<div class="cartbar">
    <button class="cart-ico" data-act="open-cart">🛒${n ? `<span class="cnt">${n}</span>` : ''}</button>
    ${n
      ? `<div style="flex:1;text-align:right;margin-right:10px"><span class="muted">已选</span> <b>${n}</b> 份</div>`
      : '<div style="flex:1"></div>'}
    <button class="btn-order" data-act="open-cart" ${n ? '' : 'disabled'}>下 单</button>
  </div>`;
}

function recentDishes() {
  const ids = [];
  for (const o of state.orders) {
    for (const it of o.items) if (!ids.includes(it.dishId)) ids.push(it.dishId);
    if (ids.length >= 5) break;
  }
  return ids.map(id => findDish(id)).filter(Boolean).slice(0, 5);
}

/* ---------------- 食记 ---------------- */
function pageFoodie() {
  const sub = state.ui.foodieTab;
  const seg = (k, n) => `<button class="${sub === k ? 'active' : ''}" data-act="foodie-tab" data-v="${k}">${n}</button>`;
  return `
  <div class="hero" style="padding-bottom:8px">
    <div class="kicker">FOOD DIARY</div>
    <h1>食记</h1>
  </div>
  <div class="segs">${seg('orders', '订单')}${seg('basket', '菜篮')}${seg('fridge', '冰箱')}</div>
  ${sub === 'orders' ? foodieOrders() : sub === 'basket' ? foodieBasket() : foodieFridge()}
  `;
}

function orderStatus(o) {
  const st = o.items.map(i => i.status);
  const rest = st.filter(s => s !== 'canceled');
  if (!rest.length) return ['canceled', '已取消'];
  if (rest.every(s => s === 'done')) return ['done', '已完成'];
  if (rest.some(s => s === 'cooking' || s === 'done')) return ['cooking', '制作中'];
  return ['wait', '待接单'];
}

function foodieOrders() {
  if (!state.orders.length) return emptyHTML('🍽️', '还没有订单', '去点菜页挑几道菜吧');
  return `<div class="pad" style="padding-bottom:100px">
    ${state.orders.map(o => {
      const [cls, txt] = orderStatus(o);
      return `<div class="card order-card" data-act="order-open" data-v="${o.id}">
        <div class="row between" style="margin-bottom:8px">
          <div style="font-weight:700">${esc(prettyDate(o.date))} <span class="muted">${esc(o.meal)}</span></div>
          <span class="stamp ${cls}">${txt}</span>
        </div>
        <div class="muted">${o.items.map(i => esc(i.name)).join('、')}</div>
        ${o.note ? `<div class="muted" style="margin-top:6px">备注：${esc(o.note)}</div>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function foodieBasket() {
  const restock = state.basket.filter(b => b.restock);
  const list = state.basket.filter(b => !b.restock && b.date === state.ui.basketDate && (state.ui.basketMeal === '全天' || b.meal === state.ui.basketMeal));
  const bought = list.filter(b => b.bought).length;
  const total = list.reduce((n, b) => n + Number(b.price || 0) * Number(b.qty || 0), 0);
  const meals = ['全天', '早餐', '午餐', '晚餐', '下午茶', '夜宵'];
  return `<div class="pad" style="padding-bottom:110px">
    <div class="row between" style="margin:6px 0 10px">
      <input type="date" id="basket-date" value="${state.ui.basketDate}" style="border:1px solid var(--line);border-radius:10px;padding:6px 8px;background:#fff" />
      <button class="pill gold" data-act="basket-add">＋ 添加食材</button>
    </div>
    ${restock.length ? `
    <h3 style="margin:4px 0 8px">要补货 · 冰箱吃完了的</h3>
    ${restock.map(b => `
      <div class="card">
        <div class="basket-item">
          <div style="flex:1;min-width:0">
            <div style="font-weight:600">${esc(b.name)}</div>
            <div class="muted">${esc(b.storage || '常温')}${b.cat ? ' · ' + esc(b.cat) : ''}</div>
          </div>
          <button class="btn sm green" data-act="basket-back" data-v="${b.id}">买回来了</button>
          <button class="btn sm" data-act="basket-del" data-v="${b.id}">删</button>
        </div>
      </div>`).join('')}` : ''}
    <div class="row wrap" style="margin-bottom:10px">
      ${meals.map(m => `<button class="chip ${state.ui.basketMeal === m ? 'red' : ''}" data-act="basket-meal" data-v="${m}" style="${state.ui.basketMeal === m ? 'border:1px solid #e6c9c2' : ''}">${m}</button>`).join('')}
    </div>
    ${list.length ? list.map(b => `
      <div class="card">
        <div class="basket-item">
          <button class="tick ${b.bought ? 'on' : ''}" data-act="basket-buy" data-v="${b.id}">${b.bought ? '✓' : ''}</button>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600">${esc(b.name)} <span class="muted">× ${money(b.qty)}${esc(b.unit)}</span></div>
            <div class="muted">${esc(b.meal)}</div>
          </div>
          <div style="text-align:right">
            <div class="muted">单价/总价</div>
            <div class="row" style="gap:4px">
              <input type="number" min="0" step="0.1" data-role="bprice" data-id="${b.id}" value="${b.price || ''}" placeholder="单价" style="width:58px" />
              <span class="muted">¥${money(Number(b.price || 0) * Number(b.qty || 0))}</span>
            </div>
          </div>
          <button class="btn sm danger" data-act="basket-del" data-v="${b.id}">删</button>
        </div>
      </div>`).join('') : (restock.length ? '' : emptyHTML('🧺', '菜篮空空的', '点右上角添加要买的食材'))}
  </div>
  ${list.length ? `<div class="basketbar">
      <div>已买 <b>${bought}</b>/${list.length}</div>
      <div class="spacer"></div>
      <button class="btn green" data-act="basket-fridge">放入冰箱</button>
      <div style="margin-left:8px">共计 <b>${money(total)}</b> 元</div>
    </div>` : ''}`;
}

function fridgeStats() {
  let soon = 0, bad = 0;
  state.fridge.forEach(f => {
    const d = daysLeft(f.expire);
    if (d < 0) bad++;
    else if (d <= 2) soon++;
  });
  const pending = state.basket.filter(b => b.restock).length;
  return { all: state.fridge.length, soon, bad, restock: state.requests.length + pending };
}

function foodieFridge() {
  const st = fridgeStats();
  const f = state.ui.fridge;
  let list = state.fridge.slice();
  if (f.stat === 'soon') list = list.filter(x => { const d = daysLeft(x.expire); return d >= 0 && d <= 2; });
  if (f.stat === 'bad') list = list.filter(x => daysLeft(x.expire) < 0);
  if (f.stat === 'restock') list = [];
  if (f.storage) list = list.filter(x => x.storage === f.storage);
  if (f.cat) list = list.filter(x => x.cat === f.cat);
  const cats = ['肉禽蛋', '海鲜', '叶菜', '瓜豆', '主食', '配菜', '果饮'];

  return `<div class="pad" style="padding-bottom:110px">
    <div class="stat4">
      ${statCell('all', st.all, '全部')}
      ${statCell('soon', st.soon, '快过期')}
      ${statCell('bad', st.bad, '已过期')}
      ${statCell('restock', st.restock, '需补货')}
    </div>
    <div class="stor3">
      ${['冷冻', '冷藏', '常温'].map(s => `<button class="${f.storage === s ? 'on' : ''}" data-act="fridge-stor" data-v="${s}">${s === '冷冻' ? '❄️' : s === '冷藏' ? '💧' : '☀️'} ${s}</button>`).join('')}
    </div>
    <div class="row wrap" style="margin-bottom:10px">
      <button class="chip ${!f.cat ? 'red' : ''}" data-act="fridge-cat" data-v="">全部</button>
      ${cats.map(c => `<button class="chip ${f.cat === c ? 'red' : ''}" data-act="fridge-cat" data-v="${c}">${c}</button>`).join('')}
      <button class="chip" data-act="fridge-add">＋ 添加</button>
    </div>

    ${f.stat === 'restock' ? restockListHTML() : ''}

    ${list.length ? list.map(x => {
      const d = x.expire ? daysLeft(x.expire) : null;
      let badge = '<span class="exp-badge exp-ok">正常</span>';
      if (!state.settings.notifyExpire) badge = '';
      else if (d === null) badge = '<span class="exp-badge exp-ok">常备</span>';
      else if (d < 0) badge = '<span class="exp-badge exp-bad">已过期</span>';
      else if (d <= 2) badge = `<span class="exp-badge exp-soon">${d === 0 ? '今天到期' : d + ' 天后到期'}</span>`;
      return `<div class="card">
        <div class="fridge-item">
          <div class="mini" style="width:42px;height:42px;border-radius:12px;background:#faf2df;display:flex;align-items:center;justify-content:center;font-size:20px">${x.storage === '冷冻' ? '❄️' : x.storage === '常温' ? '🥫' : '🧊'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600">${esc(x.name)}</div>
            <div class="muted">${esc(x.storage || '常温')}${x.cat ? ' · ' + esc(x.cat) : ''}${x.expire ? ' · ' + esc(x.expire) : ''}</div>
          </div>
          ${badge}
        </div>
        <div class="row" style="gap:6px;justify-content:flex-end;margin-top:6px">
          <button class="btn sm primary" data-act="fridge-eaten" data-v="${x.id}">吃完了</button>
          <button class="btn sm" data-act="fridge-del" data-v="${x.id}">删</button>
        </div>
      </div>`;
    }).join('') : emptyHTML('🧊', f.stat === 'restock' ? '没有待补货的食材' : '这里空空如也', '点右上角「添加食材」，或从菜篮买完放进来')}

    <div class="card" style="margin-top:14px">
      <div class="row between"><span>提醒：过期、补货</span><button class="btn sm ${state.settings.notifyExpire ? 'green' : ''}" data-act="toggle-notify">${state.settings.notifyExpire ? '开' : '关'}</button></div>
    </div>
  </div>`;
}

function statCell(k, v, name) {
  return `<button class="cell" style="border:${state.ui.fridge.stat === k ? '1.5px solid var(--gold)' : '1px solid var(--line)'}" data-act="fridge-stat" data-v="${k}"><b>${v}</b><span>${name}</span></button>`;
}

function restockListHTML() {
  const pending = state.basket.filter(b => b.restock);
  if (!state.requests.length && !pending.length) return '';
  return `${pending.length ? `<div class="card" style="border-color:#f0d5cf;background:var(--red-soft)">
    <h3>吃完了，等着买</h3>
    ${pending.map(b => `<div class="row between" style="padding:6px 0">
      <span>${esc(b.name)}</span>
      <button class="btn sm green" data-act="basket-back" data-v="${b.id}">买回来了</button>
    </div>`).join('')}
  </div>` : ''}
  ${state.requests.length ? `<div class="card" style="border-color:#f0d5cf;background:var(--red-soft)">
    <h3>催进货</h3>
    ${state.requests.map(r => `<div class="row between" style="padding:6px 0">
      <span>${esc(r.name)}</span>
      <button class="btn sm" data-act="req-done" data-v="${esc(r.name)}">已补货</button>
    </div>`).join('')}
  </div>` : ''}`;
}

function emptyHTML(ico, a, b) {
  return `<div class="empty"><span class="big">${ico}</span>${a}${b ? `<br><span style="font-size:12px">${b}</span>` : ''}</div>`;
}

/* ---------------- 厨房 ---------------- */
function pageKitchen() {
  const isCook = state.profile.role === 'cook';
  const active = state.orders.filter(o => !['done', 'canceled'].includes(orderStatus(o)[0]));
  const pendingDishes = state.dishes.filter(d => d.pending);
  const todo = [];
  active.forEach(o => o.items.forEach(it => {
    if (it.status === 'canceled') return;
    const d = findDish(it.dishId) || state.dishes.find(x => x.name === it.name);
    if (d && !todo.some(x => x.id === d.id)) todo.push(d);
  }));

  return `<div class="hero" style="padding-bottom:10px">
    <div class="kicker">KITCHEN</div>
    <h1>厨房</h1>
    <div class="sub">当前身份：${isCook ? '👨‍🍳 厨师' : '🍽️ 吃货'}</div>
  </div>
  <div class="pad">
    <div class="card">
      <div class="row between">
        <div>
          <div style="font-weight:700">${esc(state.profile.cookName)}</div>
          <div class="muted">厨师可以接单、看菜谱、审菜谱</div>
        </div>
        <button class="btn ${isCook ? 'green' : 'primary'}" data-act="role" data-v="${isCook ? 'foodie' : 'cook'}">${isCook ? '切换成吃货' : '切换成厨师'}</button>
      </div>
    </div>

    ${state.requests.length ? `<div class="card" style="border-color:#f0d5cf;background:var(--red-soft)">
      <h3>🔔 催进货（优先处理）</h3>
      ${state.requests.map(r => `<div class="row between" style="padding:6px 0">
        <span>${esc(r.name)}</span>
        <button class="btn sm green" data-act="req-done" data-v="${esc(r.name)}">补上了</button>
      </div>`).join('')}
    </div>` : ''}

    <div class="card">
      <h3>订单处理</h3>
      ${active.length ? active.map(o => {
        const [cls, txt] = orderStatus(o);
        return `<div style="padding:8px 0;border-bottom:1px dashed var(--line)">
          <div class="row between" style="margin-bottom:6px">
            <div style="font-weight:600">${esc(prettyDate(o.date))} ${esc(o.meal)} <span class="stamp ${cls}" style="font-size:10px">${txt}</span></div>
            <button class="btn sm" data-act="order-open" data-v="${o.id}">详情</button>
          </div>
          ${o.items.map((it, idx) => `<div class="row between" style="padding:3px 0">
            <span class="muted" ${it.status === 'canceled' ? 'style="text-decoration:line-through"' : ''}>${esc(it.name)}</span>
            <span class="row" style="gap:4px">
              ${['wait', 'cooking', 'done', 'canceled'].map(s => `<button class="btn sm ${it.status === s ? (s === 'canceled' ? 'danger' : 'primary') : ''}" data-act="item-status" data-v="${o.id}:${idx}:${s}" style="font-size:11px">${s === 'wait' ? '待接' : s === 'cooking' ? '制作中' : s === 'done' ? '已完成' : '取消'}</button>`).join('')}
            </span>
          </div>`).join('')}
        </div>`;
      }).join('') : `<div class="muted">暂时没有待处理的订单</div>`}
    </div>

    <div class="card">
      <h3>🍳 这次怎么做${todo.length ? `（${todo.length} 道）` : ''}</h3>
      ${todo.length ? todo.map(d => `<div style="padding:9px 0;border-bottom:1px dashed var(--line)">
        <div style="font-weight:700">${d.emoji || '🍲'} ${esc(d.name)}</div>
        <div class="muted" style="margin:2px 0 5px">${(d.ingredients || []).map(i => `${esc(i.name)} ${money(i.qty)}${esc(i.unit)}`).join(' · ') || '不用食材'}</div>
        <div style="white-space:pre-line;line-height:1.6">${esc(d.steps || '还没写做法')}</div>
      </div>`).join('') : `<div class="muted">还没有要做完的菜，等下单了这里会列出来</div>`}
    </div>

    ${pendingDishes.length ? `<div class="card" style="border-color:#cfe7d9">
      <h3>🍽️ 吃货上传的菜谱</h3>
      ${pendingDishes.map(d => `<div class="row between" style="padding:6px 0">
        <span>${d.emoji || '🍲'} ${esc(d.name)}</span>
        <span class="row" style="gap:4px">
          <button class="btn sm green" data-act="dish-approve" data-v="${d.id}">通过</button>
          <button class="btn sm danger" data-act="dish-reject" data-v="${d.id}">拒绝</button>
        </span>
      </div>`).join('')}
    </div>` : ''}

    <div class="card">
      <div class="row between"><h3 style="margin:0">菜品管理</h3><button class="btn sm" data-act="manage-dishes">全部菜品</button></div>
      <div class="muted" style="margin-top:6px">共 ${state.dishes.length} 道菜，${state.categories.length} 个分类</div>
    </div>
  </div>`;
}

/* ---------------- 我 ---------------- */
function pageMe() {
  return `<div class="hero" style="padding-bottom:10px">
    <div class="kicker">ME</div>
    <h1>我的</h1>
  </div>
  <div class="pad">
    <div class="card">
      <div class="row between" style="margin-bottom:8px"><span>做饭的人</span><b>${esc(state.profile.cookName)}</b></div>
      <div class="row between"><span>点菜的人</span><b>${esc(state.profile.foodieName)}</b></div>
      <div class="hr"></div>
      <div class="row between"><span>当前身份</span><span>${state.profile.role === 'cook' ? '👨‍🍳 厨师' : '🍽️ 吃货'}</span></div>
      <div class="row" style="margin-top:10px;gap:8px">
        <button class="btn ${state.profile.role === 'cook' ? 'primary' : ''}" data-act="role" data-v="cook">我是厨师</button>
        <button class="btn ${state.profile.role === 'foodie' ? 'primary' : ''}" data-act="role" data-v="foodie">我是吃货</button>
      </div>
    </div>

    <div class="card">
      <h3>小统计</h3>
      <div class="row between" style="padding:4px 0"><span>做好的订单</span><b>${doneInfo().orders} 单</b></div>
      <div class="row between" style="padding:4px 0"><span>做过的菜</span><b>${doneInfo().dishes} 道</b></div>
      <div class="row between" style="padding:4px 0"><span>菜品数量</span><b>${state.dishes.filter(d => !d.pending).length} 道</b></div>
      <div class="row between" style="padding:4px 0"><span>冰箱食材</span><b>${state.fridge.length} 样</b></div>
    </div>

    <div class="card">
      <h3>数据</h3>
      <div class="muted" style="margin-bottom:8px">这个版本的数据只存在当前浏览器里，换个设备、清掉缓存就没了。</div>
      <div class="row" style="gap:8px">
        <button class="btn danger" data-act="clear-data">清空所有数据</button>
      </div>
    </div>

    <div class="muted" style="text-align:center;font-size:12px;padding:10px 0">专属小厨房 · 单机版 v1</div>
  </div>`;
}

/* ---------------- 添加/编辑菜品 ---------------- */
function dishFormHTML(d) {
  const isNew = !d;
  d = d || { name: '', cat: state.ui.cat, emoji: '🍲', ingredients: [], steps: '', pending: false };
  return `
  <h2>${isNew ? '添加菜品' : '编辑菜品'}</h2>
  <div class="muted" style="margin-bottom:6px">${state.profile.role === 'foodie' && isNew ? '吃货上传的菜谱要厨师确认后才会出现在菜单里' : '填好保存就行'}</div>
  <div class="field"><label>菜名</label><input id="f-name" value="${esc(d.name)}" placeholder="比如 番茄炒蛋" /></div>
  <div class="field"><label>分类</label>
    <select id="f-cat">${state.categories.map(c => `<option value="${c.id}" ${d.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
  </div>
  <div class="field"><label>图标</label>
    <div class="row" style="gap:8px">
      <input id="f-emoji" value="${esc(d.emoji)}" style="width:64px;text-align:center;font-size:22px" />
      <div class="emojis">${EMOJIS.map(e => `<button data-act="emoji" data-v="${e}">${e}</button>`).join('')}</div>
    </div>
  </div>
  <div class="field"><label>食材（没有食材限制的菜可以空着）</label>
    <div id="f-ings">
      ${(d.ingredients || []).map(ing => ingRowHTML(ing.name, ing.qty, ing.unit)).join('') || ingRowHTML('', '', '个')}
    </div>
    <button class="btn sm" data-act="ing-add" style="align-self:flex-start;margin-top:4px">＋ 加一个食材</button>
  </div>
  <div class="field"><label>做法步骤</label><textarea id="f-steps" placeholder="1. 热锅下油…">${esc(d.steps)}</textarea></div>
  <div class="row" style="gap:8px;margin-top:14px">
    <button class="btn" data-act="close">取消</button>
    <div class="spacer"></div>
    <button class="btn primary" data-act="dish-save" data-v="${d.id || ''}">保存</button>
  </div>`;
}

function ingRowHTML(n, q, u) {
  return `<div class="ing-row">
    <input class="n" data-role="ing-name" placeholder="食材名" value="${esc(n)}" />
    <input class="q" data-role="ing-qty" type="number" min="0" step="0.5" placeholder="数量" value="${esc(q)}" />
    <select data-role="ing-unit" style="flex:.8;border:1px solid var(--line);border-radius:12px;background:#fff;padding:6px">
      ${UNITS.map(x => `<option ${x === u ? 'selected' : ''}>${x}</option>`).join('')}
    </select>
    <button class="btn sm danger" data-act="ing-del">×</button>
  </div>`;
}

/* ---------------- 事件 ---------------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const act = t.dataset.act;
  const v = t.dataset.v || '';

  switch (act) {
    case 'tab': state.ui.tab = v; save(); render(); break;
    case 'foodie-tab': state.ui.foodieTab = v; save(); render(); break;

    /* 点菜 */
    case 'cat': state.ui.cat = v; state.ui.search = ''; save(); render(); break;
    case 'cart-add': addToCart(v); break;
    case 'mix-add': addIngToCart(v); break;
    case 'open-cart': openCart(); break;
    case 'random': {
      const ok = state.dishes.filter(d => !d.pending);
      if (!ok.length) return toast('菜单还是空的');
      const d = ok[Math.floor(Math.random() * ok.length)];
      addToCart(d.id);
      toast(`随到了「${d.name}」`);
      break;
    }
    case 'urge': {
      if (!state.requests.find(r => r.name === v)) state.requests.push({ id: uid(), name: v, at: Date.now() });
      save(); render(); toast('已催厨师进货');
      break;
    }
    case 'meal-pick': openMealPicker(); break;

    /* 菜品 */
    case 'add-dish': sheet(dishFormHTML(null)); break;
    case 'dish-open': openDishDetail(v); break;
    case 'dish-save': saveDish(v); break;
    case 'manage-dishes': openDishManager(); break;
    case 'emoji': { const inp = $('#f-emoji'); if (inp) inp.value = v; break; }
    case 'ing-add': { $('#f-ings').insertAdjacentHTML('beforeend', ingRowHTML('', '', '个')); break; }
    case 'ing-del': t.closest('.ing-row').remove(); break;
    case 'dish-approve': { const d = findDish(v); if (d) d.pending = false; save(); render(); toast('已加入菜单'); break; }
    case 'dish-reject': {
      state.dishes = state.dishes.filter(d => d.id !== v); save(); render(); toast('已拒绝'); break;
    }
    case 'dish-del': {
      if (!confirm('确定删掉这道菜？')) return;
      state.dishes = state.dishes.filter(d => d.id !== v); save(); render(); closeSheet(); toast('已删除');
      break;
    }
    case 'dish-edit': { const d = findDish(v); if (d) sheet(dishFormHTML(d)); break; }
    case 'close': closeSheet(); break;

    /* 购物车 / 下单 */
    case 'cart-plus': { const c = state.cart.find(x => cartKey(x) === v); if (c) c.qty++; save(); render(); openCart(); break; }
    case 'cart-minus': {
      const c = state.cart.find(x => cartKey(x) === v);
      if (c) { c.qty--; if (c.qty <= 0) state.cart = state.cart.filter(x => x !== c); }
      save(); if (state.cart.length) openCart(); else closeSheet(); render(); break;
    }
    case 'order-submit': submitOrder(); break;

    /* 订单 */
    case 'order-open': openOrderDetail(v); break;
    case 'order-del': {
      if (!confirm('删掉这一单？')) return;
      state.orders = state.orders.filter(x => x.id !== v);
      save(); render(); closeSheet(); toast('订单已删除');
      break;
    }
    case 'item-status': {
      const [oid, idx, s] = v.split(':');
      const o = state.orders.find(x => x.id === oid);
      const it = o && o.items[Number(idx)];
      if (!it) break;
      it.status = s;
      save(); render();
      if (!$('#modal').classList.contains('hidden')) openOrderDetail(oid);
      break;
    }

    /* 菜篮 */
    case 'basket-add': openBasketAdd(); break;
    case 'basket-meal': state.ui.basketMeal = v; save(); render(); break;
    case 'basket-buy': {
      const b = state.basket.find(x => x.id === v);
      if (b) b.bought = !b.bought;
      save(); render(); break;
    }
    case 'basket-del': state.basket = state.basket.filter(x => x.id !== v); save(); render(); break;
    case 'basket-fridge': basketToFridge(); break;

    /* 冰箱 */
    case 'fridge-stat': state.ui.fridge.stat = v; save(); render(); break;
    case 'fridge-stor': state.ui.fridge.storage = (state.ui.fridge.storage === v ? '' : v); save(); render(); break;
    case 'fridge-cat': state.ui.fridge.cat = v; save(); render(); break;
    case 'fridge-del': state.fridge = state.fridge.filter(x => x.id !== v); save(); render(); break;
    /* 吃完了：从冰箱拿走，同时进菜篮等着买 */
    case 'fridge-eaten': fridgeEaten(v); break;
    case 'basket-back': basketBack(v); break;
    case 'fridge-add': openFridgeAdd(); break;
    case 'toggle-notify': state.settings.notifyExpire = !state.settings.notifyExpire; save(); render(); break;

    /* 厨房 */
    case 'role': state.profile.role = v; save(); render(); toast(v === 'cook' ? '现在是厨师' : '现在是吃货'); break;
    case 'req-done': {
      if (state.requests.find(x => x.name === v)) addIng(v);
      state.requests = state.requests.filter(x => x.name !== v);
      save(); render(); toast('已补进冰箱');
      break;
    }

    /* 其他 */
    case 'clear-data': {
      if (!confirm('确定清空所有数据？菜单、订单、冰箱都会没有')) return;
      if (!confirm('再确认一次：这个操作没法撤销')) return;
      localStorage.removeItem(KEY);
      state = defaultState();
      save(); render(); toast('已清空');
      break;
    }
  }
});

/* 搜索 */
document.addEventListener('input', e => {
  if (e.target.id === 'dish-search') {
    state.ui.search = e.target.value;
    save();
    const area = $('#dish-area');
    if (area) area.innerHTML = dishGridHTML();
    const cats = $('#cat-list');
    if (cats) cats.innerHTML = catsHTML();
  }
  if (e.target.id === 'basket-date') {
    state.ui.basketDate = e.target.value;
    save(); render();
  }
  if (e.target.dataset && e.target.dataset.role === 'bprice') {
    const b = state.basket.find(x => x.id === e.target.dataset.id);
    if (b) { b.price = Number(e.target.value) || 0; save(); }
  }
});

/* ---------------- 具体操作 ---------------- */
function addToCart(id) {
  const d = findDish(id);
  if (!d) return;
  const c = state.cart.find(x => cartKey(x) === id);
  if (c) c.qty++;
  else state.cart.push({ key: id, dishId: id, name: d.name, emoji: d.emoji, qty: 1 });
  save(); render();
  toast(`已加「${d.name}」`);
}
/* 未分类页的食材混搭：单独一样食材也能进购物车，不挂菜谱 */
function addIngToCart(name) {
  const k = 'ing:' + name;
  const c = state.cart.find(x => cartKey(x) === k);
  if (c) c.qty++;
  else state.cart.push({ key: k, name, emoji: '🥢', qty: 1 });
  save(); render();
  toast(`已加「${name}」`);
}
function cartKey(c) { return c.key || c.dishId; }
function cartName(c) {
  return c.name || (findDish(c.dishId) || {}).name || '食材';
}
function cartEmoji(c) {
  return c.emoji || (findDish(c.dishId) || {}).emoji || '🥢';
}

function openCart() {
  if (!state.cart.length) return toast('购物车是空的');
  const rows = state.cart.map(c => {
    const k = cartKey(c);
    return `<div class="dishline">
      <div class="mini">${cartEmoji(c)}</div>
      <div style="flex:1"><div style="font-weight:600">${esc(cartName(c))}</div></div>
      <div class="row" style="gap:6px">
        <button class="btn sm" data-act="cart-minus" data-v="${esc(k)}">−</button>
        <b>${c.qty}</b>
        <button class="btn sm" data-act="cart-plus" data-v="${esc(k)}">＋</button>
      </div>
    </div>`;
  }).join('');
  sheet(`<h2>确认点单</h2>
    <div class="muted" style="margin-bottom:4px">${esc(state.profile.foodieName)} 点给 ${esc(state.profile.cookName)} · ${esc(prettyDate(state.ui.date))} ${esc(state.ui.meal)}</div>
    ${rows}
    <div class="field"><label>订单备注</label><input id="order-note" placeholder="比如：多放点辣，谢谢！" /></div>
    <div class="row" style="gap:8px;margin-top:10px">
      <button class="btn" data-act="close">再想想</button>
      <div class="spacer"></div>
      <button class="btn primary" data-act="order-submit">提交订单</button>
    </div>`);
}

function submitOrder() {
  const note = ($('#order-note')?.value || '').trim();
  const items = [];
  state.cart.forEach(c => {
    for (let i = 0; i < c.qty; i++) {
      items.push({ dishId: c.dishId || '', name: cartName(c), emoji: cartEmoji(c), status: 'wait' });
    }
  });
  state.orders.unshift({
    id: uid(), date: state.ui.date, meal: state.ui.meal, note, createdAt: Date.now(), items
  });
  state.cart = [];
  save(); closeSheet(); render();
  toast('下单成功，等厨师接单～');
}

function openOrderDetail(id) {
  const o = state.orders.find(x => x.id === id);
  if (!o) return;
  const [cls, txt] = orderStatus(o);
  const isCook = state.profile.role === 'cook';
  sheet(`<h2>订单详情</h2>
    <div class="row between" style="margin:6px 0 12px">
      <div><b>${esc(prettyDate(o.date))}</b> <span class="muted">${esc(o.meal)}</span></div>
      <span class="stamp ${cls}">${txt}</span>
    </div>
    ${o.note ? `<div class="card" style="background:#fffdf8"><div class="muted">订单备注</div><div>${esc(o.note)}</div></div>` : ''}
    <div class="card">
      <div class="row between" style="margin-bottom:4px"><b>已选菜品</b><span class="muted">${o.items.length} 道</span></div>
      ${o.items.map((it, idx) => {
        const stTxt = it.status === 'done' ? ['done', '已完成'] : it.status === 'canceled' ? ['canceled', '已取消'] : it.status === 'cooking' ? ['cooking', '制作中'] : ['wait', '待出餐'];
        return `<div class="dishline">
          <div class="mini">${it.emoji || '🍲'}</div>
          <div style="flex:1"><div style="font-weight:600">${esc(it.name)}</div></div>
          ${isCook ? `<span class="row" style="gap:3px">
            ${['wait', 'cooking', 'done', 'canceled'].map(s => `<button class="btn sm ${it.status === s ? (s === 'canceled' ? 'danger' : 'primary') : ''}" data-act="item-status" data-v="${o.id}:${idx}:${s}" style="font-size:11px">${s === 'wait' ? '待接' : s === 'cooking' ? '制作中' : s === 'done' ? '完成' : '取消'}</button>`).join('')}
          </span>` : `<span class="stamp ${stTxt[0]}" style="font-size:10px">${stTxt[1]}</span>`}
        </div>`;
      }).join('')}
    </div>
    <div class="row" style="gap:8px;margin-top:10px">
      <button class="btn danger" data-act="order-del" data-v="${o.id}">删除订单</button>
      <div class="spacer"></div>
      <button class="btn" data-act="close">关闭</button>
    </div>`);
}

function openMealPicker() {
  const meals = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];
  sheet(`<h2>选日期和餐次</h2>
    <div class="field"><label>日期</label><input type="date" id="pick-date" value="${state.ui.date}" /></div>
    <div class="field"><label>餐次</label>
      <div class="row wrap" style="gap:6px">
        ${meals.map(m => `<button class="btn ${state.ui.meal === m ? 'primary' : ''}" data-act="pick-meal-tmp" data-v="${m}">${m}</button>`).join('')}
      </div>
    </div>
    <div class="row" style="gap:8px;margin-top:12px">
      <button class="btn" data-act="close">取消</button>
      <button class="btn" data-act="pick-meal-now">用现在的时间</button>
      <div class="spacer"></div>
      <button class="btn primary" data-act="pick-meal-save">确定</button>
    </div>`);
}

function openDishDetail(id) {
  const d = findDish(id);
  if (!d) return;
  const miss = dishMiss(d);
  sheet(`<h2>${d.emoji || '🍲'} ${esc(d.name)}</h2>
    <div class="row wrap" style="gap:6px;margin-bottom:10px">
      <span class="chip">${esc((state.categories.find(c => c.id === d.cat) || {}).name || '未分类')}</span>
      ${miss.length ? `<span class="chip red">缺 ${esc(miss.map(m => m.name).join('、'))}</span>` : `<span class="chip green">食材齐了</span>`}
    </div>
    ${(d.ingredients || []).length ? `<div class="card"><h3>食材</h3>
      ${d.ingredients.map(i => `<div class="row between" style="padding:3px 0"><span>${esc(i.name)}</span><span class="muted">${esc(money(i.qty))}${esc(i.unit)}</span></div>`).join('')}
    </div>` : ''}
    ${d.steps ? `<div class="card"><h3>做法</h3><div style="white-space:pre-line">${esc(d.steps)}</div></div>` : ''}
    <div class="row" style="gap:8px;margin-top:10px">
      <button class="btn" data-act="close">关闭</button>
      <div class="spacer"></div>
      <button class="btn" data-act="dish-edit" data-v="${d.id}">编辑</button>
      <button class="btn primary" data-act="add-from-detail" data-v="${d.id}" ${miss.length ? 'disabled' : ''}>加入购物车</button>
    </div>`);
}

function saveDish(id) {
  const name = ($('#f-name')?.value || '').trim();
  if (!name) return toast('菜名不能空着');
  const cat = $('#f-cat').value;
  const emoji = ($('#f-emoji').value || '🍲').trim().slice(0, 4);
  const steps = $('#f-steps').value.trim();
  const ingredients = [...document.querySelectorAll('#f-ings .ing-row')].map(row => ({
    name: row.querySelector('[data-role=ing-name]').value.trim(),
    qty: Number(row.querySelector('[data-role=ing-qty]').value) || 0,
    unit: row.querySelector('[data-role=ing-unit]').value
  })).filter(i => i.name && i.qty > 0);

  if (id) {
    const d = findDish(id);
    Object.assign(d, { name, cat, emoji, steps, ingredients });
    save(); closeSheet(); render(); toast('已保存');
  } else {
    const pending = state.profile.role === 'foodie';
    state.dishes.push({ id: uid(), name, cat, emoji, steps, ingredients, pending });
    save(); closeSheet(); render();
    toast(pending ? '已提交，等厨师确认' : '菜品已添加');
  }
}

function openDishManager() {
  sheet(`<h2>管理菜品</h2>
    <div class="muted" style="margin-bottom:8px">共 ${state.dishes.length} 道</div>
    ${state.dishes.map(d => `<div class="dishline">
      <div class="mini">${d.emoji || '🍲'}</div>
      <div style="flex:1">
        <div style="font-weight:600">${esc(d.name)} ${d.pending ? '<span class="chip red" style="font-size:10px">待确认</span>' : ''}</div>
        <div class="muted">${esc((state.categories.find(c => c.id === d.cat) || {}).name || '未分类')}</div>
      </div>
      <button class="btn sm" data-act="dish-edit" data-v="${d.id}">改</button>
      <button class="btn sm danger" data-act="dish-del" data-v="${d.id}">删</button>
    </div>`).join('')}
    <div class="row" style="margin-top:12px">
      <button class="btn" data-act="close">关闭</button>
      <div class="spacer"></div>
      <button class="btn primary" data-act="add-dish">＋ 新菜</button>
    </div>`);
}

function openBasketAdd() {
  sheet(`<h2>添加食材到菜篮</h2>
    <div class="field"><label>食材名</label><input id="b-name" placeholder="比如 鸡蛋" /></div>
    <div class="row" style="gap:8px">
      <div class="field" style="flex:1"><label>数量</label><input id="b-qty" type="number" min="0.5" step="0.5" value="1" /></div>
      <div class="field" style="width:90px"><label>单位</label><select id="b-unit">${UNITS.map(u => `<option>${u}</option>`).join('')}</select></div>
      <div class="field" style="flex:1"><label>单价（元）</label><input id="b-price" type="number" min="0" step="0.1" placeholder="0" /></div>
    </div>
    <div class="field"><label>归到哪一餐</label>
      <select id="b-meal">${['全天', '早餐', '午餐', '晚餐', '下午茶', '夜宵'].map(m => `<option ${m === (state.ui.basketMeal === '全天' ? '全天' : state.ui.basketMeal) ? 'selected' : ''}>${m}</option>`).join('')}</select>
    </div>
    <div class="row" style="gap:8px;margin-top:12px">
      <button class="btn" data-act="close">取消</button>
      <div class="spacer"></div>
      <button class="btn primary" data-act="basket-save">添加</button>
    </div>`);
}

function basketToFridge() {
  const list = state.basket.filter(b => !b.restock && b.date === state.ui.basketDate && (state.ui.basketMeal === '全天' || b.meal === state.ui.basketMeal));
  const bought = list.filter(b => b.bought);
  if (!bought.length) return toast('先勾选买好的食材');
  bought.forEach(b => addIng(b.name, { storage: '冷藏', cat: '配菜', expire: addDays(todayStr(), shelfLife({ name: b.name, storage: '冷藏', cat: '配菜' })) }));
  state.basket = state.basket.filter(b => !bought.includes(b));
  save(); render(); toast(`放进冰箱 ${bought.length} 样`);
}

function openFridgeAdd() {
  sheet(`<h2>添加食材</h2>
    <div class="field"><label>食材名</label><input id="s-name" placeholder="比如 鸡蛋" /></div>
    <div class="row" style="gap:8px">
      <div class="field" style="flex:1"><label>放在哪</label><select id="s-storage"><option>冷藏</option><option>冷冻</option><option>常温</option></select></div>
      <div class="field" style="flex:1"><label>保质到（可不填）</label><input id="s-expire" type="date" /></div>
    </div>
    <div class="row" style="gap:8px;margin-top:12px">
      <button class="btn" data-act="close">取消</button>
      <div class="spacer"></div>
      <button class="btn primary" data-act="fridge-save">添加</button>
    </div>`);
}

/* ---------------- 补充事件（弹窗内保存类） ---------------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const act = t.dataset.act;
  if (act === 'basket-save') {
    const name = ($('#b-name')?.value || '').trim();
    if (!name) return toast('食材名不能空');
    state.basket.push({
      id: uid(), name,
      qty: Number($('#b-qty').value) || 1,
      unit: $('#b-unit').value,
      price: Number($('#b-price').value) || 0,
      meal: $('#b-meal').value,
      date: state.ui.basketDate,
      bought: false
    });
    save(); closeSheet(); render(); toast('已加到菜篮');
  }
  if (act === 'fridge-save') {
    const name = ($('#s-name')?.value || '').trim();
    if (!name) return toast('食材名不能空');
    const storage = $('#s-storage').value;
    const expire = $('#s-expire').value || addDays(todayStr(), shelfLife({ name, storage }));
    const old = findIng(name);
    if (old) {
      if (expire) old.expire = expire;
    } else {
      state.fridge.push({ id: uid(), name, qty: 1, unit: '', storage, cat: '', expire });
    }
    save(); closeSheet(); render(); toast('已放进冰箱');
  }
  if (act === 'pick-meal-tmp') {
    state._tmpMeal = t.dataset.v;
    document.querySelectorAll('[data-act=pick-meal-tmp]').forEach(b => {
      b.classList.toggle('primary', b.dataset.v === state._tmpMeal);
    });
  }
  if (act === 'pick-meal-save') {
    const d = $('#pick-date')?.value;
    if (d) state.ui.date = d;
    if (state._tmpMeal) state.ui.meal = state._tmpMeal;
    state.ui.manual = !(state.ui.date === todayStr() && state.ui.meal === mealNow());
    delete state._tmpMeal;
    save(); closeSheet(); render();
  }
  if (act === 'pick-meal-now') {
    state.ui.manual = false;
    state.ui.date = todayStr();
    state.ui.meal = mealNow();
    delete state._tmpMeal;
    save(); closeSheet(); render();
  }
  if (act === 'add-from-detail') {
    addToCart(t.dataset.v);
    closeSheet();
  }
});

/* ---------------- 日期/餐次跟随实际时间 ---------------- */
function syncClock() {
  if (state.ui.manual) return;
  const t = todayStr();
  const m = mealNow();
  if (state.ui.date === t && state.ui.meal === m) return;
  state.ui.date = t;
  state.ui.meal = m;
  save();
  if (!$('#modal').classList.contains('hidden')) return;
  if (state.ui.tab === 'order') render();
}

/* ---------------- 启动 ---------------- */
(function () {
  const h = (location.hash || '').replace('#', '');
  if (['order', 'foodie', 'kitchen', 'me'].includes(h)) state.ui.tab = h;
})();
syncClock();
save();
render();
setInterval(syncClock, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) syncClock(); });
