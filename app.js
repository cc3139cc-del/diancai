/* 专属小厨房 · 单机版
   数据全部存在浏览器 localStorage，换设备/清缓存会丢。 */

const KEY = 'diancai_v1';
const DATA_VER = 15;
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
/* 保质期按买回来那天算，天数按食材分：冷冻统一 90 天，其余照常见保鲜期 */
const SHELF_DAYS = {
  '鸡蛋': 21, '酸奶': 21,
  '维他奶': 180, '椰汁': 180, '大米': 180, '面条': 180, '酸菜': 180,
  '香蕉': 5, '柿子': 7, '番茄': 5, '玉米': 5, '鸡枞菇': 5,
  '苹果': 14, '梨': 14, '湿粉丝': 7, '豆干': 7,
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
  const s = {
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
        steps: '1. 量米：家里的米杯装满大约是 2 两，一个人吃 1 杯就够\n2. 洗米：米放碗里加水没过，用手转着圈搓几下倒掉水，重复 2 遍，水从浑浊变清就行\n3. 加水：米倒进电煮锅内胆，水要高出米面一个食指指节（约 1.5 厘米）；1 杯米加约 1.2 杯水\n4. 泡 10 分钟再开火，米粒吸水均匀（赶时间可省）\n5. 开最大档盖盖烧开，锅边冒白汽就是开了（约 5 分钟）\n6. 调最小档，盖盖焖 20–25 分钟，中途别开盖\n7. 判断熟了：表面没有水汪着，用饭勺扒开中间，米粒透亮不发白\n8. 关火后再盖着焖 5 分钟，然后用饭勺从底往上翻松' },
      { id: 'd2', name: '番茄鸡蛋面', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '面条', qty: 1, unit: '把' }, { name: '番茄', qty: 1, unit: '个' }, { name: '鸡蛋', qty: 1, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 番茄 1 个顶部划十字，放碗里倒开水烫 30 秒，皮卷起来就撕掉，切小块（切小才容易出汁）\n2. 鸡蛋 1 个打碗里，筷子打散，加一小撮盐\n3. 锅擦干倒 1 汤勺油，最大档；筷子插进油里周围冒小泡就是热了\n4. 下番茄块，用勺子边炒边压 2–3 分钟，炒到软烂、汁水变红\n5. 加 2 碗水（约 500 毫升），盖盖烧开\n6. 下面条 1 把，用筷子搅一下防粘底，按包装时间煮（一般 3–5 分钟）\n7. 面条快熟时把蛋液转着圈细线淋进去，等 5 秒再轻搅，蛋花才成型\n8. 加半小勺盐，尝一口汤，淡了再补；怕酸可以加小半勺糖（没有就不放）' },
      { id: 'd3', name: '葱油拌面', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '面条', qty: 1, unit: '把' }, { name: '葱', qty: 1, unit: '根' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 2, unit: '勺' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '1. 葱 1 根洗净擦干（一定要干，带水下油会溅），切成 4 厘米长的段\n2. 小碗里调汁：1 汤勺生抽、半勺糖（没有可不放）、1 汤勺清水，搅匀备用\n3. 锅擦干倒 2 汤勺油，开最小档，油微热就下葱段\n4. 慢慢炸 5–8 分钟，炸到葱段变焦黄色、发脆；全程小火，葱发黑就是糊了会苦\n5. 关火等 10 秒，把调好的汁倒进锅里搅两下，就是葱油汁\n6. 另起锅烧水，下面条 1 把煮 3–4 分钟，到筷子能夹断、中间没有白芯\n7. 面条捞出（不用冲水）放碗里，浇葱油汁，拌到每根面都油亮' },
      { id: 'd4', name: '老友粉', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '米粉', qty: 1, unit: '把' }, { name: '酸笋', qty: 1, unit: '把' }, { name: '豆豉', qty: 1, unit: '勺' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '辣椒酱', qty: 1, unit: '勺' }],
        steps: '1. 备料：酸笋 1 把切细丝，蒜 2 瓣拍扁剁末\n2. 锅擦干倒 1 汤勺油，最大档，下蒜末炒 10 秒出香味\n3. 倒酸笋丝炒 1–2 分钟，炒到生酸味变成香味\n4. 加 1 汤勺豆豉一起炒 30 秒\n5. 加 2 碗水烧开，加半小勺盐\n6. 下米粉煮 2–3 分钟（干粉按包装时间，鲜粉烫 1 分钟），筷子夹起来能弯、不硬就好\n7. 喜欢辣加 1 勺辣椒酱，尝一口咸淡再出锅' },
      { id: 'd5', name: '螺蛳粉（速食）', cat: 'main', emoji: '🍜', pending: false,
        ingredients: [{ name: '螺蛳粉', qty: 1, unit: '包' }],
        steps: '1. 拆包：粉和所有料包都拿出来分开放（后面要分开用）\n2. 锅里加 2 碗水，最大档烧开，下干粉煮 8–10 分钟（按包装写的时间），煮到筷子能夹断\n3. 粉捞出放大碗里\n4. 锅里的水倒掉，重新加 1 碗半水烧开\n5. 把汤料包、酸笋包、腐竹包倒进去煮 1 分钟\n6. 连汤浇在粉上，最后放红油包（能吃辣全放，怕辣放半包）、醋包，拌匀\n7. 调料都在料包里，不用另外加盐加酱油' },
      { id: 'd6', name: '燕麦粥', cat: 'main', emoji: '🥣', pending: false,
        ingredients: [{ name: '燕麦', qty: 1, unit: '杯' }, { name: '牛奶', qty: 1, unit: '盒' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '1. 锅擦干，倒 1 盒牛奶（约 250 毫升），开最小档\n2. 倒入 1 杯燕麦片，用勺子搅两下让燕麦都泡进牛奶里\n3. 边加热边搅，防止糊底；开始冒小泡就保持最小档，别让它大滚（会溢锅）\n4. 煮 3–5 分钟，粥变浓稠、勺子舀起来挂得住就好\n5. 想甜加半勺糖，关火；喜欢稀一点再加小半碗水' },
      { id: 'd7', name: '煮饺子', cat: 'main', emoji: '🥟', pending: false,
        ingredients: [{ name: '速冻饺子', qty: 1, unit: '袋' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '1. 锅里加 2/3 锅水，最大档烧到大滚\n2. 速冻饺子不用解冻直接下锅（解冻了皮容易破），用勺子背推着锅底转一圈防粘\n3. 水再次大开后加小半碗冷水，再开再加，一共点 3 次凉水\n4. 判断熟了：饺子全部浮起来、肚子鼓鼓、皮发亮\n5. 蘸料：碗里 1 汤勺生抽、半勺醋、几滴花椒油，喜欢辣加点辣椒酱\n6. 用漏勺捞，别用筷子夹，容易破' },
      /* 荤 */
      { id: 'd8', name: '白切鸡', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡腿', qty: 1, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '葱', qty: 1, unit: '根' }, { name: '盐', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 备料：鸡腿 1 只洗净（冷冻的先泡冷水 20 分钟化开），姜切 4 片，葱切 1 段\n2. 鸡腿放锅里，加冷水没过，放 2 片姜、葱段、1 汤勺料酒\n3. 最大档烧开，水面浮起灰白沫就用勺子撇掉\n4. 调最小档，盖盖煮 15 分钟（鸡腿大的煮 18 分钟）\n5. 判断熟：筷子戳最厚的地方能轻松戳透、拔出来没有血水\n6. 准备一盆凉水（有冰块更好），鸡腿捞出泡 5 分钟，皮会爽脆\n7. 蘸料：剩的 2 片姜剁末、葱剁花放碗里，加半小勺盐；锅里烧 1 汤勺油到冒烟，浇上去滋一下，再加 1 汤勺生抽\n8. 鸡腿斩块或手撕，蘸着吃' },
      { id: 'd9', name: '可乐鸡翅', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡翅', qty: 8, unit: '个' }, { name: '可乐', qty: 1, unit: '罐' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡翅洗净用纸巾擦干，正反面各斜划两刀（约半厘米深），熟得快也更入味\n2. 焯水：鸡翅放锅里倒冷水没过，放 3 片姜、1 汤勺料酒，最大档烧开后煮 2–3 分钟，捞出来用温水冲掉浮沫\n3. 锅洗净擦干，倒 1 汤勺油，最大档热 1 分钟；听到滋啦声就是温度够了\n4. 鸡翅厚皮那面朝下平铺进锅，别急着翻！等 3–4 分钟，底面焦黄、用筷子能推动再逐个翻面，另一面再煎 2–3 分钟\n5. 倒 1 罐可乐（没过鸡翅一半就行），加 1 汤勺生抽、半小勺盐、刚才的姜片\n6. 最大档烧开后调最小档，盖盖炖 10 分钟\n7. 开盖转最大档收汁，用勺子把汁不停浇在鸡翅上，3–5 分钟汁变黏、挂得住就关火\n8. 判断熟了：筷子能轻松戳进最厚的肉、没有血水冒出' },
      { id: 'd10', name: '啤酒鱼', cat: 'meat', emoji: '🐟', pending: false,
        ingredients: [{ name: '鱼', qty: 1, unit: '条' }, { name: '啤酒', qty: 1, unit: '罐' }, { name: '番茄', qty: 1, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 备料：鱼冲干净，里外都用厨房纸擦干（有水下锅会炸油），姜切 3 片，番茄 1 个切块\n2. 锅擦干倒 1 汤勺油，最大档烧到油面微微动\n3. 鱼贴着锅边轻放进去，别马上动，数 3 分钟；用铲子轻推，能整条滑动再翻面，另一面再煎 2 分钟\n4. 两面定形（皮不破、肉不散）后先把鱼盛出来\n5. 锅里留油，下姜片、番茄块炒 1 分钟，炒到番茄软烂出汁\n6. 鱼放回去，倒 1 罐啤酒（没过鱼一半，不够加点水），加 1 汤勺生抽、半小勺盐\n7. 盖盖最小档焖 10 分钟，中途用勺子把汁浇在鱼身上两次，鱼不用翻面\n8. 开盖最大档收汁 2 分钟，汤汁变浓就好' },
      { id: 'd11', name: '荔浦芋头蒸肉', cat: 'meat', emoji: '🍖', pending: false,
        ingredients: [{ name: '芋头', qty: 1, unit: '个' }, { name: '五花肉', qty: 200, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 五花肉 200 克切薄片（半冻状态最好切，约 0.3 厘米厚）；芋头削皮切 2 厘米厚的块（削皮戴手套，不然手会痒）\n2. 腌肉：肉片放碗里，加 1 汤勺生抽、1 汤勺料酒、半小勺盐、姜丝（姜 1 块切丝），用手抓匀放 15 分钟\n3. 拿一个深碗，芋头块铺碗底，肉片一片压一片码在芋头上\n4. 蒸锅（电煮锅加蒸笼层）加水烧开，放进去盖盖蒸 30 分钟\n5. 中途别开盖；蒸到 20 分钟可以掀个缝看一眼，水不够就补开水\n6. 判断熟了：筷子能轻松扎透芋头\n7. 出锅把碗里的汤汁倒回锅里，加半勺生抽烧浓一点浇回去更香（偷懒可省）' },
      { id: 'd12', name: '酸笋炒肉', cat: 'meat', emoji: '🌶️', pending: false,
        ingredients: [{ name: '酸笋', qty: 1, unit: '把' }, { name: '猪肉', qty: 200, unit: '克' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '辣椒酱', qty: 1, unit: '勺' }],
        steps: '1. 备料：猪肉 200 克切薄片，酸笋 1 把切丝，蒜 2 瓣切末\n2. 锅不放油，最大档，肉片直接下锅用铲子压散（五花肉自己出油；瘦肉就改成先放 1 勺油，不然粘锅）\n3. 煸 2–3 分钟，肉片出油、边缘微微焦黄\n4. 下蒜末、酸笋丝翻炒 2 分钟，炒出酸香味\n5. 加 1 汤勺生抽、半小勺盐，翻匀\n6. 喜欢辣加 1 勺辣椒酱，炒 30 秒出锅' },
      { id: 'd13', name: '柠檬鸭', cat: 'meat', emoji: '🦆', pending: false,
        ingredients: [{ name: '鸭肉', qty: 500, unit: '克' }, { name: '柠檬', qty: 2, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 备料：鸭肉 500 克剁成 3 厘米的块（买的时候让老板剁好），姜 1 块切片，蒜 2 瓣拍扁，柠檬 2 个：1 个切片、1 个留着挤汁\n2. 焯水：鸭肉冷水下锅，加 2 片姜、1 汤勺料酒，最大档烧开后再煮 3 分钟，捞出冲掉浮沫\n3. 锅擦干倒 1 汤勺油，最大档，下姜片、蒜炒 30 秒出香味\n4. 倒鸭肉翻炒 3 分钟，炒到鸭皮收紧、微微出油\n5. 加 1 汤勺生抽、半小勺盐、柠檬片，加水没过鸭肉一半\n6. 盖盖调最小档焖 20 分钟（鸭肉厚就 25 分钟）\n7. 咬一块试试，能烂、没有生鸭味就好了\n8. 出锅前挤半个柠檬的汁翻匀（柠檬汁早放会发苦）' },
      { id: 'd14', name: '番茄炖牛腩', cat: 'meat', emoji: '🍲', pending: false,
        ingredients: [{ name: '牛腩', qty: 300, unit: '克' }, { name: '番茄', qty: 2, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 备料：牛腩 300 克切 3 厘米块，番茄 2 个切块，姜 3 片\n2. 焯水：牛腩冷水下锅，加姜片、1 汤勺料酒，最大档烧开后再煮 3 分钟，捞出用温水冲掉浮沫\n3. 锅洗净擦干倒 1 汤勺油，最大档，下番茄炒 3 分钟，用勺子压烂，炒成红色汤汁\n4. 倒牛腩翻匀，加 1 汤勺生抽，再倒热水没过牛腩（一定要热水，冷水会让肉变硬）\n5. 盖盖最小档炖 40 分钟（电煮锅火力小的话炖 50 分钟），中途水少了加开水\n6. 判断熟了：筷子能扎透牛腩\n7. 最后加半小勺盐，尝好味道再关火' },
      /* 素 */
      { id: 'd15', name: '凉拌黄瓜', cat: 'veg', emoji: '🥒', pending: false,
        ingredients: [{ name: '黄瓜', qty: 1, unit: '根' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '1. 黄瓜 1 根洗净，用刀背拍几下拍裂，再切成 3 厘米长的段（拍过比切片更入味）\n2. 撒半小勺盐抓匀，放 10 分钟出水，把水倒掉（不然拌出来汤汤水水）\n3. 蒜 2 瓣切末\n4. 黄瓜放碗里，加 1 汤勺生抽、1 汤勺醋、蒜末、几滴花椒油\n5. 拌匀放 5 分钟再吃；想更爽口放冰箱冰 10 分钟' },
      { id: 'd16', name: '清炒时蔬', cat: 'veg', emoji: '🥬', pending: false,
        ingredients: [{ name: '青菜', qty: 1, unit: '把' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 青菜 1 把（油菜、小白菜都行）洗净掰成小棵，甩一甩水\n2. 蒜 2 瓣切片\n3. 锅擦干倒 1 汤勺油，最大档，下蒜片炒 10 秒出香味\n4. 下青菜马上翻炒，炒 1–2 分钟，菜叶变深绿、梗变软就好\n5. 加半小勺盐翻两下立刻出锅（炒久了出水发黄）\n6. 锅里水多就一直最大档多炒几十秒收掉' },
      { id: 'd17', name: '酸辣土豆丝', cat: 'veg', emoji: '🥔', pending: false,
        ingredients: [{ name: '土豆', qty: 1, unit: '个' }, { name: '干辣椒', qty: 3, unit: '个' }, { name: '醋', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 土豆 1 个削皮，先切 2 毫米薄片再切丝（新手用刨丝器最省事）\n2. 切好放清水里泡 5 分钟，用手搓两下洗掉淀粉，捞出沥干（不泡会粘锅）\n3. 干辣椒 3 个剪成段（怕辣就把籽倒掉）\n4. 锅擦干倒 1 汤勺油，最大档，油热下干辣椒炒 5 秒，别炒黑\n5. 下土豆丝快速翻炒 2 分钟\n6. 沿锅边淋 1 汤勺醋（听到嗞声就对了），加半小勺盐翻匀\n7. 尝一根，脆而不生就出锅，炒久了就软趴趴' },
      { id: 'd18', name: '醋溜白菜', cat: 'veg', emoji: '🥬', pending: false,
        ingredients: [{ name: '白菜', qty: 1, unit: '棵' }, { name: '醋', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '白糖', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 白菜帮（硬的白色部分）斜着切薄片，白菜叶用手撕成大块，分开放\n2. 锅擦干倒 1 汤勺油，最大档，先下白菜帮炒 2 分钟\n3. 下白菜叶再炒 1 分钟到变软\n4. 加 1 汤勺醋、半勺糖（没有可不放）、1 汤勺生抽、半小勺盐\n5. 翻炒 30 秒，出锅前再淋半勺醋更香，立即关火（炒久出水变软烂）' },
      { id: 'd19', name: '蒜蓉娃娃菜', cat: 'veg', emoji: '🥬', pending: false,
        ingredients: [{ name: '娃娃菜', qty: 1, unit: '棵' }, { name: '蒜', qty: 3, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 娃娃菜 1 棵，根部切掉一点，竖着切成 4–6 条，洗净沥干\n2. 蒜 3 瓣切末放碗里\n3. 锅里烧 1 汤勺油到冒烟，浇在蒜末上滋一下，加 1 汤勺生抽、半小勺盐搅匀\n4. 娃娃菜摆进深盘，蒜蓉汁浇上去\n5. 蒸锅水烧开，放进去蒸 8 分钟\n6. 蒸出来的汤水别倒，拌着吃更鲜' },
      { id: 'd20', name: '凉拌木耳', cat: 'veg', emoji: '🥗', pending: false,
        ingredients: [{ name: '木耳', qty: 1, unit: '把' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '醋', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 木耳 1 把放冷水里泡 30 分钟（别用热水），泡软后把根部发硬的部分撕掉\n2. 锅里水烧开，木耳下锅焯 2 分钟，捞出过凉水沥干\n3. 蒜 2 瓣切末\n4. 碗里放木耳，加 1 汤勺醋、1 汤勺生抽、蒜末、半小勺盐、几滴花椒油\n5. 拌匀放 10 分钟更入味\n6. 泡好的木耳当天吃完，别隔夜' },
      { id: 'd21', name: '蒸南瓜', cat: 'veg', emoji: '🎃', pending: false,
        ingredients: [{ name: '南瓜', qty: 1, unit: '块' }],
        steps: '1. 南瓜 1 块，皮可削可不削，切成 3 厘米厚的块，挖掉籽和软瓤\n2. 摆进盘子里皮朝下（不容易碎）\n3. 蒸锅水烧开放进去，蒸 15 分钟\n4. 判断熟了：筷子能轻松扎透\n5. 本身够甜不用放调料；想更香可以淋半勺蜂蜜' },
      /* 蛋 */
      { id: 'd22', name: '水煮蛋', cat: 'egg', emoji: '🥚', pending: false,
        ingredients: [{ name: '鸡蛋', qty: 1, unit: '个' }],
        steps: '1. 鸡蛋从冰箱拿出来放 10 分钟（太冷的蛋容易煮裂）\n2. 放锅里加冷水没过鸡蛋，最大档烧开\n3. 水开后开始计时：溏心 6 分钟、半熟 8 分钟、全熟 10 分钟\n4. 到点马上捞出泡凉水 2 分钟，好剥壳、蛋黄也不发灰\n5. 剥壳：在桌上轻轻滚一圈，从钝的那头开始剥\n6. 不用放调料，想咸可以蘸点盐或生抽' },
      { id: 'd23', name: '蒸鸡蛋羹', cat: 'egg', emoji: '🍳', pending: false,
        ingredients: [{ name: '鸡蛋', qty: 2, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡蛋 2 个打碗里加半小勺盐，筷子打散 30 秒，打到看不见蛋清块\n2. 加温水，水量是蛋液的 1.5 倍（约小半碗），边倒边搅；一定用温水，开水会烫成蛋花\n3. 用勺子把表面泡泡撇掉（有泡泡蒸出来有蜂窝）\n4. 盖保鲜膜或扣个盘子（防止水汽滴进去）\n5. 蒸锅水烧开，调中档，蛋液碗放进去蒸 10 分钟\n6. 判断熟了：晃一下碗，中间不晃荡\n7. 出锅淋 1 汤勺生抽、几滴油，想香撒点葱花' },
      { id: 'd24', name: '番茄炒蛋', cat: 'egg', emoji: '🍅', pending: false,
        ingredients: [{ name: '番茄', qty: 2, unit: '个' }, { name: '鸡蛋', qty: 3, unit: '个' }, { name: '食用油', qty: 2, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '1. 番茄 2 个顶部划十字，开水烫 30 秒去皮，切小块；鸡蛋 3 个打散加半小勺盐\n2. 锅擦干倒 1 汤勺油，最大档\n3. 倒蛋液，等 10 秒底部凝固，用铲子从边上往中间推，推到八成熟、还有点湿就盛出来（别炒老）\n4. 锅里补半勺油，下番茄炒 2 分钟，用勺子压出汁\n5. 加半勺糖（没有可不放）、半小勺盐，炒匀\n6. 倒回鸡蛋翻两下让蛋吸汁，关火\n7. 最后尝一口再决定补不补盐' },
      { id: 'd25', name: '韭菜炒蛋', cat: 'egg', emoji: '🥚', pending: false,
        ingredients: [{ name: '韭菜', qty: 1, unit: '把' }, { name: '鸡蛋', qty: 2, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 韭菜 1 把洗净，切 3 厘米段（根部老的部分切掉）；鸡蛋 2 个打散加半小勺盐\n2. 锅擦干倒 1 汤勺油，最大档，倒蛋液炒散，八成熟盛出\n3. 锅里补几滴油，下韭菜最大档炒 30 秒，变深绿就进行下一步\n4. 倒回鸡蛋翻匀，尝咸淡，关火出锅\n5. 韭菜炒久会出水发黄，全程要快' },
      { id: 'd26', name: '荷包蛋', cat: 'egg', emoji: '🍳', pending: false,
        ingredients: [{ name: '鸡蛋', qty: 1, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 鸡蛋先磕进小碗（直接磕锅里容易掉蛋壳）\n2. 锅擦干倒 1 汤勺油，中档烧 1 分钟\n3. 贴着锅边轻轻倒进去，别晃锅\n4. 蛋白凝固后（约 1 分钟）在蛋黄旁边撒几粒盐，盐别撒蛋黄上容易破\n5. 想吃全熟就盖盖焖 1 分钟，或翻面煎 30 秒\n6. 底边焦脆、蛋黄半流的最好吃' },
      /* 汤 */
      { id: 'd27', name: '紫菜蛋花汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '紫菜', qty: 1, unit: '张' }, { name: '鸡蛋', qty: 1, unit: '个' }, { name: '葱', qty: 1, unit: '根' }, { name: '盐', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '1. 紫菜 1 张撕成小片，鸡蛋 1 个打散，葱切葱花\n2. 锅里加 2 碗水，最大档烧开\n3. 下紫菜煮 1 分钟\n4. 转最小档，蛋液从高处转圈细细淋下去，淋完等 10 秒再用勺子轻轻推两下（马上搅蛋花会碎）\n5. 加半小勺盐、几滴花椒油，关火撒葱花' },
      { id: 'd28', name: '白菜豆腐汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '白菜', qty: 1, unit: '棵' }, { name: '豆腐', qty: 1, unit: '块' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 白菜洗净切块，帮和叶分开放；豆腐 1 块切 2 厘米方块（嫩豆腐要轻）\n2. 锅里加 3 碗水烧开，先下白菜帮煮 3 分钟\n3. 下豆腐块，轻轻推一下水别用力搅，煮 2 分钟\n4. 下白菜叶再煮 2 分钟\n5. 加半小勺盐、滴几滴油，尝口汤再出锅' },
      { id: 'd29', name: '番茄蛋汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '番茄', qty: 1, unit: '个' }, { name: '鸡蛋', qty: 1, unit: '个' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 番茄 1 个切块（可烫皮），鸡蛋 1 个打散\n2. 锅擦干倒半勺油，最大档，下番茄炒 2 分钟炒出汁\n3. 加 2 碗水烧开\n4. 转最小档淋蛋液，等 10 秒再轻轻推两下\n5. 加半小勺盐，尝味关火' },
      { id: 'd30', name: '玉米排骨汤', cat: 'soup', emoji: '🌽', pending: false,
        ingredients: [{ name: '玉米', qty: 1, unit: '根' }, { name: '排骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 排骨 300 克冷水下锅，加 3 片姜、1 汤勺料酒，最大档烧开后再煮 3 分钟，捞出冲掉浮沫\n2. 玉米 1 根切成 4 段\n3. 排骨和玉米放回锅里，加 4 碗热水，最大档烧开\n4. 调最小档盖盖炖 40 分钟，玉米出香味、排骨变软\n5. 出锅前加 1 小勺盐，先尝再加；汤面浮油可以用勺子撇掉' },
      { id: 'd31', name: '冬瓜排骨汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '冬瓜', qty: 1, unit: '块' }, { name: '排骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 排骨焯水：冷水下锅，加姜片、1 汤勺料酒，烧开煮 3 分钟，捞出冲净\n2. 排骨加 4 碗热水、姜片，最大档烧开，调最小档炖 30 分钟\n3. 冬瓜 1 块去皮去瓤切厚片，最后 10 分钟才下（下早了会烂成泥）\n4. 加 1 小勺盐，尝味出锅' },
      { id: 'd32', name: '白萝卜猪骨汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '白萝卜', qty: 1, unit: '个' }, { name: '猪骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 猪骨 300 克冷水下锅，加姜片、1 汤勺料酒，烧开煮 3 分钟，捞出冲净\n2. 猪骨加 4 碗热水，最大档烧开，调最小档炖 30 分钟\n3. 白萝卜 1 个削皮切滚刀块，下锅再炖 15 分钟\n4. 萝卜变透明、筷子能扎透就好，加 1 小勺盐尝味' },
      /* 喝 */
      { id: 'd33', name: '热牛奶', cat: 'drink', emoji: '🥛', pending: false,
        ingredients: [{ name: '牛奶', qty: 1, unit: '盒' }],
        steps: '1. 牛奶 1 盒倒进锅里\n2. 开最小档，用勺子搅一下防糊底\n3. 边加热边看：锅边冒小泡、表面冒热气就关火\n4. 千万别烧开，开了会起一层奶皮还容易溢锅' },
      { id: 'd34', name: '柠檬水', cat: 'drink', emoji: '🍋', pending: false,
        ingredients: [{ name: '柠檬', qty: 1, unit: '个' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '1. 柠檬洗净，用盐搓一下表皮去蜡，冲干净\n2. 切 3–4 片薄片，剩下的包好留着下次用\n3. 放杯子里倒温水泡 10 分钟（水不烫手就行，太烫会苦）\n4. 怕酸加半勺蜂蜜搅匀；想喝冰的放凉后加冰块' },
      { id: 'd35', name: '红豆沙', cat: 'drink', emoji: '🫘', pending: false,
        ingredients: [{ name: '红豆', qty: 1, unit: '杯' }, { name: '冰糖', qty: 30, unit: '克' }],
        steps: '1. 红豆 1 杯洗净，泡水 4 小时以上（最好泡一晚），泡到豆子变大\n2. 倒掉泡豆水，红豆放锅里加 4 碗水\n3. 最大档烧开，调最小档盖盖煮 40–60 分钟，中途水少了加开水\n4. 判断：豆子用勺子一压就烂、汤变浓稠\n5. 加 30 克冰糖搅到化开；想更沙就用勺子把豆子压碎' },
      { id: 'd36', name: '绿豆沙', cat: 'drink', emoji: '🫘', pending: false,
        ingredients: [{ name: '绿豆', qty: 1, unit: '杯' }, { name: '冰糖', qty: 30, unit: '克' }],
        steps: '1. 绿豆 1 杯洗净，最好泡 2 小时（不泡也行，多煮 10 分钟）\n2. 加 4 碗水，最大档烧开，调最小档煮 30–40 分钟\n3. 判断：豆子开花，皮裂开、露出里面\n4. 加 30 克冰糖搅化，放凉更好喝\n5. 想快一点：煮 15 分钟关火焖 15 分钟再煮，容易开花' },
      { id: 'd37', name: '蜂蜜柚子茶', cat: 'drink', emoji: '🍯', pending: false,
        ingredients: [{ name: '柚子', qty: 1, unit: '个' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '1. 柚子洗净，用盐搓表皮，削下最外层黄色的薄皮（别带白色部分，会苦），切细丝\n2. 柚子肉剥出来撕碎，白筋和籽去掉\n3. 黄色皮丝用开水烫 1 分钟去苦味，捞出\n4. 皮丝和果肉放碗里，加 1 汤勺蜂蜜拌匀，冰箱腌 2 小时以上（能放 3 天）\n5. 喝时舀 2 勺，温水冲开' },
      { id: 'd38', name: '煮奶茶', cat: 'drink', emoji: '☕', pending: false,
        ingredients: [{ name: '红茶包', qty: 1, unit: '个' }, { name: '牛奶', qty: 1, unit: '盒' }, { name: '白糖', qty: 1, unit: '勺' }],
        steps: '1. 锅里加小半碗水烧开，放红茶包 1 个，泡 3 分钟泡浓\n2. 取出茶包（一直泡会苦）\n3. 倒牛奶 1 盒，调最小档加热，边搅边看，冒热气就关火\n4. 加半勺糖搅化，尝一下甜度' },
      /* 空气炸锅 */
      { id: 'd39', name: '烤鸡翅', cat: 'air', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡翅', qty: 6, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '蒜', qty: 2, unit: '瓣' }],
        steps: '1. 鸡翅 6 个洗净擦干，两面各划 2 刀；蒜 2 瓣切末\n2. 腌：1 汤勺生抽、1 汤勺料酒、半小勺盐、蒜末，抓匀腌 30 分钟（放冰箱）\n3. 空气炸锅 180℃ 预热 3 分钟（不预热也行，多烤 2 分钟）\n4. 鸡翅平铺进炸篮，别叠着\n5. 180℃ 烤 15 分钟，拉出来翻面，把剩下的腌料刷上\n6. 再烤 8 分钟，皮金黄、筷子插没有血水就好\n7. 每台炸锅火力不一样，第一次做第 12 分钟拉出来看一眼' },
      { id: 'd40', name: '炸薯条', cat: 'air', emoji: '🍟', pending: false,
        ingredients: [{ name: '土豆', qty: 1, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 土豆 1 个削皮切 1 厘米粗的条\n2. 泡水 10 分钟去淀粉，捞出用厨房纸擦干（一定要干，不然烤不脆）\n3. 倒 1 汤勺油、半小勺盐抓匀\n4. 200℃ 烤 18 分钟，第 10 分钟拉出来翻一次\n5. 判断：表面金黄、晃炸篮有沙沙声就好，趁热吃' },
      { id: 'd41', name: '烤火腿肠', cat: 'air', emoji: '🌭', pending: false,
        ingredients: [{ name: '火腿肠', qty: 2, unit: '个' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '1. 火腿肠 2 根剥皮，表面斜着划几刀（划到一半深，别切断）\n2. 放炸篮，180℃ 烤 8 分钟\n3. 划口张开、表面微焦就好\n4. 出炉撒椒盐粉' },
      { id: 'd42', name: '烤面包片', cat: 'air', emoji: '🍞', pending: false,
        ingredients: [{ name: '面包', qty: 2, unit: '片' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '1. 面包 2 片放炸篮，180℃ 烤 4 分钟\n2. 表面微黄、边角发脆就好（很容易焦，盯着点）\n3. 出炉抹蜂蜜或果酱，趁热吃' },
      { id: 'd43', name: '烤玉米', cat: 'air', emoji: '🌽', pending: false,
        ingredients: [{ name: '玉米', qty: 1, unit: '根' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 玉米 1 根剥叶洗净，整根或切两段\n2. 刷一层油、撒一点盐，用锡纸包住（不包会烤干）\n3. 200℃ 烤 15 分钟，拉出来翻面再烤 5 分钟\n4. 判断：玉米粒金黄、有香味\n5. 不包锡纸更焦香，但要 10 分钟就翻面别烤糊' },
      { id: 'd44', name: '烤紫薯', cat: 'air', emoji: '🍠', pending: false,
        ingredients: [{ name: '紫薯', qty: 1, unit: '个' }],
        steps: '1. 紫薯 1 个洗净擦干（不用削皮），个头大的切两半更好熟\n2. 放炸篮，200℃ 烤 25 分钟，第 15 分钟翻一次\n3. 判断：筷子能轻松戳透\n4. 出炉放凉一点再吃，很烫' },
      { id: 'd45', name: '烤豆腐', cat: 'air', emoji: '🍢', pending: false,
        ingredients: [{ name: '豆腐', qty: 1, unit: '块' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '孜然粉', qty: 1, unit: '瓶' }],
        steps: '1. 豆腐 1 块（老豆腐更好，不容易碎）切 1.5 厘米厚的片，厨房纸吸干水\n2. 小碗里 1 汤勺生抽、1 汤勺油搅匀，刷在豆腐两面\n3. 200℃ 烤 15 分钟，翻面再刷一次酱，再烤 5 分钟\n4. 出炉撒孜然粉' },
      { id: 'd46', name: '烤时蔬', cat: 'air', emoji: '🥬', pending: false,
        ingredients: [{ name: '青菜', qty: 1, unit: '把' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 青菜 1 把洗净沥干（水多就擦一下）\n2. 倒 1 汤勺油、半小勺盐抓匀\n3. 200℃ 烤 12 分钟，中间翻一次\n4. 叶子边缘微焦就好，烤久了会干' },
      /* 按 11-15 采购的食材加的 */
      { id: 'd47', name: '云吞面', cat: 'main', emoji: '🥟', pending: false,
        ingredients: [{ name: '云吞', qty: 1, unit: '袋' }, { name: '面条', qty: 1, unit: '把' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '1. 锅里加 2 碗水，最大档烧开\n2. 先下云吞，轻轻推一下防粘，煮 4–5 分钟，浮起来后再煮 1 分钟就熟\n3. 用漏勺把云吞捞出放大碗里\n4. 同一锅水下面条 1 把，煮 3 分钟（按包装时间），筷子能夹断就行\n5. 调碗底：空碗放 1 汤勺生抽、半小勺盐、几滴花椒油，舀一勺热汤冲开（先调好汤底再放面）\n6. 面条捞进碗里，云吞铺在上面，撒一点椒盐粉，尝一口汤再决定要不要补生抽' },
      { id: 'd50', name: '牛肉卷涮酸菜', cat: 'meat', emoji: '🍲', pending: false,
        ingredients: [{ name: '牛肉卷', qty: 1, unit: '袋' }, { name: '酸菜', qty: 1, unit: '包' }, { name: '白胡椒粉', qty: 1, unit: '瓶' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 酸菜 1 包挤干水分（袋里泡着的酸水倒掉），牛肉卷从冷冻拿出来不用解冻\n2. 锅里加 2 碗水，最大档烧开\n3. 下酸菜煮 3 分钟，让酸味和咸味出来\n4. 牛肉卷一片片抖散下锅，别一整坨扔进去\n5. 一变色（约 30 秒–1 分钟）马上捞，久了就柴了；筷子夹着涮着吃也行\n6. 撒白胡椒粉；酸菜本身有咸味，先尝汤再决定加不加盐' },
      { id: 'd51', name: '虾仁炒蛋', cat: 'egg', emoji: '🍤', pending: false,
        ingredients: [{ name: '虾仁', qty: 1, unit: '袋' }, { name: '鸡蛋', qty: 2, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '1. 虾仁（冷冻的先泡冷水 10 分钟化开）沥干水，用椒盐粉抓匀腌 5 分钟\n2. 鸡蛋 2 个打散加半小勺盐\n3. 锅擦干倒半勺油，中档，虾仁下锅炒 1 分钟，变红卷起就盛出\n4. 补半勺油，倒蛋液炒到半凝固\n5. 倒回虾仁翻两下关火\n6. 虾仁一变红就熟，炒久了会硬' },
      { id: 'd52', name: '清炒鸡枞菇', cat: 'veg', emoji: '🍄', pending: false,
        ingredients: [{ name: '鸡枞菇', qty: 1, unit: '盒' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '椒盐粉', qty: 1, unit: '瓶' }],
        steps: '1. 鸡枞菇 1 盒，根部切掉一点，用手撕成条（撕的比切的入味），快速冲一下沥干\n2. 锅擦干倒 1 汤勺油，最大档\n3. 下菇条炒 3 分钟，菇会先出水再收干，炒到变软、边缘微焦\n4. 加半小勺盐、撒点椒盐粉翻匀出锅\n5. 菇很吸油，觉得干可以补几滴油' },
      { id: 'd53', name: '凉拌沙葛', cat: 'veg', emoji: '🥗', pending: false,
        ingredients: [{ name: '沙葛', qty: 1, unit: '个' }, { name: '辣椒酱', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }],
        steps: '1. 沙葛 1 个削厚皮，外面那层硬皮都要削掉，露出白白脆脆的肉\n2. 切成细丝（刨丝器最省事）\n3. 碗里放沙葛丝，加 1 汤勺辣椒酱、1 汤勺生抽、半勺醋\n4. 拌开，放冰箱冰 10 分钟更脆\n5. 出水是正常的，吃前再拌一下' },
      { id: 'd54', name: '豆干炒辣椒', cat: 'veg', emoji: '🌶️', pending: false,
        ingredients: [{ name: '豆干', qty: 1, unit: '块' }, { name: '辣椒酱', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }],
        steps: '1. 豆干 1 块切 0.5 厘米厚的片\n2. 锅擦干倒 1 汤勺油，中档，豆干下锅煎 2 分钟\n3. 翻面再煎 2 分钟，两面微黄发硬就好（煎过的豆干不容易碎）\n4. 加 1 汤勺辣椒酱、1 汤勺生抽，翻匀 30 秒出锅\n5. 家里有新鲜辣椒的话切 2 个一起炒更香' },
      { id: 'd55', name: '潮汕牛肉丸汤', cat: 'soup', emoji: '🥣', pending: false,
        ingredients: [{ name: '牛肉丸', qty: 1, unit: '袋' }, { name: '白胡椒粉', qty: 1, unit: '瓶' }, { name: '盐', qty: 1, unit: '勺' }, { name: '葱', qty: 1, unit: '根' }],
        steps: '1. 锅里加 3 碗水，最大档烧开\n2. 牛肉丸 1 袋倒进去（冷冻的不用解冻），中档煮 5 分钟\n3. 判断熟了：丸子全浮起来、体积变大\n4. 加半小勺盐，撒白胡椒粉和葱花\n5. 想更鲜可以加几滴生抽或一小把紫菜' },
      { id: 'd56', name: '椰汁汤圆', cat: 'drink', emoji: '🍡', pending: false,
        ingredients: [{ name: '汤圆', qty: 1, unit: '袋' }, { name: '椰汁', qty: 1, unit: '瓶' }],
        steps: '1. 锅里加 2 碗水烧开\n2. 汤圆 1 袋倒进去（冷冻的不用解冻），用勺子推一下防粘\n3. 中档煮 4–5 分钟，汤圆浮起来后再煮 1 分钟\n4. 判断熟了：浮起来、按一下能弹回\n5. 捞进碗里倒椰汁；想喝热的先把椰汁温一下' },
      { id: 'd57', name: '酸奶水果杯', cat: 'drink', emoji: '🍎', pending: false,
        ingredients: [{ name: '酸奶', qty: 1, unit: '袋' }, { name: '苹果', qty: 1, unit: '个' }, { name: '香蕉', qty: 1, unit: '把' }, { name: '蜂蜜', qty: 1, unit: '勺' }],
        steps: '1. 苹果 1 个洗净切小块（不爱吃皮就削掉），香蕉 1 根切片\n2. 放碗里倒酸奶 1 袋拌匀\n3. 想甜淋半勺蜂蜜\n4. 现拌现吃，放久了香蕉会发黑' },
      { id: 'd58', name: '烤蜜薯', cat: 'air', emoji: '🍠', pending: false,
        ingredients: [{ name: '蜜薯', qty: 1, unit: '个' }],
        steps: '1. 蜜薯 1 个洗净擦干，大的切两半\n2. 200℃ 烤 25 分钟，第 15 分钟翻面\n3. 筷子能戳透就好，不削皮直接吃，皮焦香' },
      { id: 'd59', name: '烤鸡枞菇', cat: 'air', emoji: '🍄', pending: false,
        ingredients: [{ name: '鸡枞菇', qty: 1, unit: '盒' }, { name: '孜然粉', qty: 1, unit: '瓶' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 鸡枞菇 1 盒撕成条，快速冲一下沥干\n2. 倒 1 汤勺油、半小勺盐、撒孜然粉抓匀\n3. 190℃ 烤 12 分钟，中间翻一次\n4. 边缘微焦、水分收干就好' },
      { id: 'd60', name: '烤南瓜馒头片', cat: 'air', emoji: '🍞', pending: false,
        ingredients: [{ name: '南瓜馒头', qty: 1, unit: '袋' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 南瓜馒头 1 袋，冷冻的先放 10 分钟稍微化一下好切\n2. 切成 1.5 厘米厚的片\n3. 两面刷薄薄一层油\n4. 180℃ 烤 6 分钟，表面微黄、外皮按着脆就好；想更脆翻面再 2 分钟' },
      { id: 'd61', name: '烤土豆角', cat: 'air', emoji: '🥔', pending: false,
        ingredients: [{ name: '土豆', qty: 1, unit: '个' }, { name: '孜然粉', qty: 1, unit: '瓶' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 土豆 1 个削皮（不削也行，洗净），切船形角（先切厚片再斜着切）\n2. 泡水 5 分钟去淀粉，捞出擦干\n3. 倒 1 汤勺油、孜然粉、半小勺盐抓匀\n4. 200℃ 烤 18 分钟，第 10 分钟翻一次\n5. 边缘焦黄、筷子能扎透就好' },
      /* 按 2026-11-19 买菜带回来的食材加的 */
      { id: 'd62', name: '香煎牛排', cat: 'meat', emoji: '🥩', pending: false,
        ingredients: [{ name: '牛排', qty: 1, unit: '块' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '白胡椒粉', qty: 1, unit: '瓶' }],
        steps: '1. 回温：牛排提前 20 分钟从冷冻拿出来（冷藏解冻更好，提前半天），拆袋用厨房纸把两面吸干，湿的煎不出焦壳\n2. 腌：两面各撒半小勺盐、一点白胡椒粉，用手抹匀放 10 分钟\n3. 锅擦干倒 1 汤勺油，最大档烧 2 分钟到油面微微冒烟\n4. 牛排平放进去，会滋啦一声，别动它，数 2 分钟\n5. 用夹子或铲子翻面，再煎 2 分钟（约七分熟；想吃全熟每面 3 分钟）\n6. 关火盛出，放盘子里静置 3 分钟再切（让肉汁回流，切开不流血水）\n7. 切条或切块，撒点椒盐粉也行' },
      { id: 'd63', name: '酸汤肥牛', cat: 'meat', emoji: '🍲', pending: false,
        ingredients: [{ name: '牛肉卷', qty: 1, unit: '袋' }, { name: '湿粉丝', qty: 1, unit: '袋' }, { name: '辣椒酱', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '葱', qty: 1, unit: '根' }],
        steps: '1. 湿粉丝冲一下水；葱切葱花；牛肉卷不用解冻\n2. 锅里加 2 碗水，最大档烧开\n3. 下湿粉丝煮 2 分钟，能用筷子夹断就捞出放碗里\n4. 同一锅水下牛肉卷抖散，一变色（约 30 秒）立刻捞出，铺在粉丝上\n5. 调汤：空碗放 1 汤勺辣椒酱、1 汤勺醋、半小勺盐，舀半碗热汤冲开搅匀\n6. 把调味汤倒进粉丝碗，撒葱花\n7. 尝一口，太酸加点水，不够辣再加辣酱' },
      { id: 'd64', name: '虾滑蒸蛋', cat: 'egg', emoji: '🍤', pending: false,
        ingredients: [{ name: '虾滑', qty: 1, unit: '袋' }, { name: '鸡蛋', qty: 2, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '葱', qty: 1, unit: '根' }],
        steps: '1. 鸡蛋 2 个加半小勺盐打散，加 1.5 倍温水搅匀，撇掉浮沫\n2. 虾滑用勺子挖成板栗大小的小段，轻轻放进蛋液里，别搅动\n3. 盖保鲜膜或扣盘子，蒸锅水开上锅，中档蒸 12 分钟\n4. 判断熟了：晃碗不晃荡、虾滑变成粉红\n5. 出锅淋 1 汤勺生抽，撒葱花' },
      { id: 'd65', name: '辣椒炒蛋', cat: 'egg', emoji: '🌶️', pending: false,
        ingredients: [{ name: '辣椒', qty: 1, unit: '把' }, { name: '鸡蛋', qty: 3, unit: '个' }, { name: '食用油', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }],
        steps: '1. 辣椒 1 把洗净去蒂切圈（怕辣把籽挖掉）；鸡蛋 3 个打散加半小勺盐\n2. 锅擦干倒 1 汤勺油，最大档，倒蛋液炒散，八成熟盛出\n3. 锅里下辣椒炒 1 分钟，炒到辣椒皮起皱出香味\n4. 倒回鸡蛋，加半小勺盐、淋几滴生抽，翻匀出锅\n5. 辣椒不辣的可以再加半勺辣椒酱' },
      { id: 'd66', name: '冰糖炖梨', cat: 'drink', emoji: '🍐', pending: false,
        ingredients: [{ name: '梨', qty: 1, unit: '个' }, { name: '冰糖', qty: 30, unit: '克' }],
        steps: '1. 梨 1 个削皮，切掉顶部当盖子，用勺子挖掉中间的核（挖个小坑别挖穿）\n2. 坑里放 30 克冰糖，盖回梨盖；不想麻烦就直接切块\n3. 放进碗里加小半碗水，蒸锅水开上锅蒸 30 分钟；或直接放锅里加水没过梨、最小档煮 30 分钟\n4. 判断：梨变软、筷子能轻松扎透\n5. 连汤一起吃，热吃凉吃都行' },
      { id: 'd67', name: '烤鸡腿', cat: 'air', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡腿', qty: 2, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '蒜', qty: 2, unit: '瓣' }],
        steps: '1. 鸡腿 2 个洗净擦干，在肉厚的地方划 2–3 刀（深到快见骨），好熟也入味\n2. 腌：1 汤勺生抽、1 汤勺料酒、半小勺盐、蒜末（2 瓣），抓匀腌 30 分钟\n3. 190℃ 烤 20 分钟\n4. 拉出来翻面，再烤 8 分钟\n5. 判断：筷子戳最厚处没有血水；想让皮更脆，最后 3 分钟调到 200℃' },
      /* 她爱吃排骨，11-19 补的 */
      { id: 'd68', name: '红烧排骨', cat: 'meat', emoji: '🍖', pending: false,
        ingredients: [{ name: '排骨', qty: 300, unit: '克' }, { name: '姜', qty: 1, unit: '块' }, { name: '葱', qty: 1, unit: '根' }, { name: '生抽', qty: 2, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '冰糖', qty: 20, unit: '克' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 排骨 300 克（让老板剁成 4 厘米段）冲干净，姜 3 片，葱切葱花\n2. 焯水：排骨冷水下锅，加姜片、1 汤勺料酒，最大档烧开后煮 3 分钟，捞出用温水冲掉浮沫\n3. 炒糖色（新手可跳过）：锅擦干倒 1 汤勺油，放 20 克冰糖，最小档慢慢搅；糖化开变浅褐色、冒小泡时马上下排骨（变黑就苦了，倒掉重来）\n4. 下排骨翻炒 2 分钟，每块都沾上颜色\n5. 加 2 汤勺生抽、姜片，倒热水没过排骨\n6. 盖盖最小档焖 25 分钟\n7. 开盖最大档收汁 5 分钟，边收边翻，汁变浓裹在排骨上\n8. 加半小勺盐（先尝，生抽有咸味），撒葱花\n（跳过炒糖色就直接热油下排骨炒到表面变色，一样好吃。）' },
      { id: 'd69', name: '烤排骨', cat: 'air', emoji: '🍖', pending: false,
        ingredients: [{ name: '排骨', qty: 300, unit: '克' }, { name: '生抽', qty: 2, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '蒜', qty: 3, unit: '瓣' }, { name: '盐', qty: 1, unit: '勺' }, { name: '孜然粉', qty: 1, unit: '瓶' }],
        steps: '1. 排骨 300 克（剁好的）洗净擦干\n2. 腌：2 汤勺生抽、1 汤勺料酒、半小勺盐、蒜末（3 瓣），抓匀腌 40 分钟放冰箱\n3. 炸篮铺锡纸（好收拾），排骨平铺别叠着\n4. 200℃ 烤 20 分钟\n5. 翻面再烤 8 分钟\n6. 出炉撒孜然粉，趁热吃' },
      /* 她说鸡翅鸡腿多来点，11-19 补的 */
      { id: 'd70', name: '照烧鸡腿', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡腿', qty: 2, unit: '个' }, { name: '生抽', qty: 2, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '蜂蜜', qty: 1, unit: '勺' }, { name: '姜', qty: 1, unit: '块' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡腿 2 个，用剪刀从骨头那边剪开摊平（不会剪就划几刀让肉变薄），姜切片\n2. 腌：1 汤勺生抽、1 汤勺料酒、姜片，抓匀腌 15 分钟\n3. 锅擦干倒 1 汤勺油，最大档，鸡腿皮朝下放进去\n4. 煎到皮金黄（3–4 分钟），用铲子压一压让皮贴锅，翻面再煎 3 分钟\n5. 调照烧汁：小碗里 1 汤勺生抽、1 汤勺蜂蜜、2 汤勺水搅匀\n6. 倒进锅里转最小档，盖盖焖 3 分钟\n7. 开盖最大档收汁，用勺子不停把汁浇在鸡腿上，汁变亮变黏就关火\n8. 切块装盘，锅里剩的汁淋上去' },
      { id: 'd71', name: '凉拌鸡丝', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡腿', qty: 2, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '葱', qty: 1, unit: '根' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '醋', qty: 1, unit: '勺' }, { name: '辣椒酱', qty: 1, unit: '勺' }, { name: '花椒油', qty: 1, unit: '勺' }],
        steps: '1. 鸡腿 2 个冷水下锅，加姜 2 片，最大档烧开后调最小档煮 15 分钟\n2. 判断熟：筷子戳最厚处没有血水\n3. 捞出放凉（想快就泡凉水 5 分钟）\n4. 顺着肉的纹理用手撕成条，放碗里\n5. 调汁：1 汤勺生抽、1 汤勺醋、1 汤勺辣椒酱、蒜末（2 瓣）、几滴花椒油，搅匀\n6. 淋上拌匀，撒葱花，拌好放 5 分钟更入味' },
      { id: 'd72', name: '鸡枞菇焖鸡腿', cat: 'meat', emoji: '🍄', pending: false,
        ingredients: [{ name: '鸡腿', qty: 2, unit: '个' }, { name: '鸡枞菇', qty: 1, unit: '盒' }, { name: '姜', qty: 1, unit: '块' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡腿 2 个剁块（或切大块），鸡枞菇 1 盒撕条，姜 3 片，蒜 2 瓣拍扁\n2. 焯水：鸡块冷水下锅，加姜片、1 汤勺料酒，最大档烧开后再煮 3 分钟，捞出冲净\n3. 锅擦干倒 1 汤勺油，最大档，下姜蒜炒 30 秒\n4. 下鸡块翻炒 3 分钟，炒到表面变白收紧\n5. 加 1 汤勺生抽、小半碗热水，盖盖最小档焖 15 分钟\n6. 下鸡枞菇再焖 5 分钟，菇出的水正好收进汤汁\n7. 加半小勺盐翻匀出锅' },
      { id: 'd73', name: '香煎鸡翅', cat: 'meat', emoji: '🍗', pending: false,
        ingredients: [{ name: '鸡翅', qty: 6, unit: '个' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '蒜', qty: 2, unit: '瓣' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡翅 6 个洗净擦干，两面各划 2 刀；蒜 2 瓣切末\n2. 腌：1 汤勺生抽、1 汤勺料酒、半小勺盐、蒜末，抓匀腌 20 分钟\n3. 锅擦干倒半汤勺油（鸡翅自己出油，油少点），最大档\n4. 鸡翅厚皮面朝下平铺，煎 4 分钟不动\n5. 底面金黄后用筷子逐个翻面，火力减一档再煎 3–4 分钟\n6. 判断熟：筷子插最厚处没有血水\n7. 出锅撒一点椒盐粉更香' },
      { id: 'd74', name: '番茄鸡翅', cat: 'meat', emoji: '🍅', pending: false,
        ingredients: [{ name: '鸡翅', qty: 6, unit: '个' }, { name: '番茄', qty: 2, unit: '个' }, { name: '姜', qty: 1, unit: '块' }, { name: '料酒', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }, { name: '食用油', qty: 1, unit: '勺' }],
        steps: '1. 鸡翅 6 个划刀，姜 3 片，番茄 2 个切块（可烫皮）\n2. 焯水：鸡翅冷水下锅，加姜片、1 汤勺料酒，烧开后再煮 2 分钟，捞出冲净\n3. 锅擦干倒 1 汤勺油，最大档，下番茄炒 3 分钟压出汁\n4. 下鸡翅翻炒 1 分钟，加 1 汤勺生抽、小半碗热水\n5. 盖盖最小档焖 12 分钟\n6. 开盖加半小勺盐，最大档收汁 3 分钟，汁裹住鸡翅' },
      { id: 'd75', name: '柠檬鸡翅', cat: 'air', emoji: '🍋', pending: false,
        ingredients: [{ name: '鸡翅', qty: 6, unit: '个' }, { name: '柠檬', qty: 1, unit: '个' }, { name: '蜂蜜', qty: 1, unit: '勺' }, { name: '生抽', qty: 1, unit: '勺' }, { name: '盐', qty: 1, unit: '勺' }],
        steps: '1. 鸡翅 6 个划刀擦干；柠檬 1 个：半个挤汁，半个切片\n2. 腌：柠檬汁、1 汤勺生抽、半小勺盐、1 汤勺蜂蜜，抓匀腌 30 分钟\n3. 180℃ 烤 15 分钟\n4. 翻面铺上柠檬片，再烤 8 分钟\n5. 出炉再挤几滴柠檬汁；柠檬片烤久了会苦，第 18 分钟可以先拿掉' }
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
      { id: 'f11', name: '牛肉卷', qty: 1, unit: '袋', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
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
      { id: 'f40', name: '鸡精', qty: 1, unit: '', storage: '常温', cat: '配菜', expire: '' },
      /* 按 2026-11-19 买回来的（鸡蛋本来就有，这里不再加） */
      { id: 'f42', name: '葱', qty: 1, unit: '把', storage: '冷藏', cat: '配菜', expire: addDays(t, 7) },
      { id: 'f43', name: '姜', qty: 1, unit: '块', storage: '常温', cat: '配菜', expire: addDays(t, 60) },
      { id: 'f44', name: '辣椒', qty: 1, unit: '把', storage: '冷藏', cat: '配菜', expire: addDays(t, 7) },
      { id: 'f45', name: '牛排', qty: 1, unit: '块', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
      { id: 'f46', name: '鸡腿', qty: 2, unit: '个', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
      { id: 'f47', name: '鸡翅', qty: 6, unit: '个', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
      { id: 'f48', name: '排骨', qty: 1, unit: '块', storage: '冷冻', cat: '肉禽蛋', expire: addDays(t, 90) },
      { id: 'f49', name: '梨', qty: 3, unit: '个', storage: '常温', cat: '果饮', expire: addDays(t, 14) },
      { id: 'f50', name: '虾滑', qty: 1, unit: '袋', storage: '冷冻', cat: '海鲜', expire: addDays(t, 90) },
      { id: 'f51', name: '湿粉丝', qty: 1, unit: '袋', storage: '冷藏', cat: '主食', expire: addDays(t, 7) }
    ],
    requests: []
  };
  /* 食材都带购买日，没填保质到就按购买日 + 保鲜天数算出来 */
  s.fridge.forEach(x => {
    x.bought = x.bought || t;
    if (!x.expire) x.expire = addDays(x.bought, shelfLife(x));
  });
  return s;
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
        // v9：补上购买日（按 11-15 那张小票），没保质期的按购买日算出来
        if (v < 9) {
          m.fridge.forEach(x => {
            x.bought = x.expire ? addDays(x.expire, -shelfLife(x)) : '2026-11-15';
            if (!x.expire) x.expire = addDays(x.bought, shelfLife(x));
          });
        }
        // v10：11-19 又去买菜了，把这些补进冰箱，再补上给新食材配的菜
        if (v < 10) {
          const bought = '2026-11-19';
          [
            ['葱', '把', '冷藏', '配菜'],
            ['姜', '块', '常温', '配菜'],
            ['辣椒', '把', '冷藏', '配菜'],
            ['牛排', '块', '冷冻', '肉禽蛋'],
            ['鸡腿', '个', '冷冻', '肉禽蛋'],
            ['鸡翅', '个', '冷冻', '肉禽蛋'],
            ['排骨', '块', '冷冻', '肉禽蛋'],
            ['梨', '个', '常温', '果饮'],
            ['虾滑', '袋', '冷冻', '海鲜'],
            ['湿粉丝', '袋', '冷藏', '主食']
          ].forEach(([name, unit, storage, cat]) => {
            if (!m.fridge.some(x => x.name === name)) {
              m.fridge.push({ id: uid(), name, qty: 1, unit, storage, cat, bought, expire: addDays(bought, shelfLife({ name, storage, cat })) });
            }
          });
          const fresh = ['d62', 'd63', 'd64', 'd65', 'd66', 'd67'];
          d.dishes.filter(x => fresh.includes(x.id)).forEach(x => {
            if (!m.dishes.some(y => y.name === x.name)) m.dishes.push(x);
          });
        }
        // v11：给她补两道排骨的菜
        if (v < 11) {
          ['d68', 'd69'].forEach(id => {
            const x = d.dishes.find(y => y.id === id);
            if (x && !m.dishes.some(y => y.name === x.name)) m.dishes.push(x);
          });
        }
        // v12：鸡翅鸡腿再加几道
        if (v < 12) {
          ['d70', 'd71', 'd72', 'd73', 'd74', 'd75'].forEach(id => {
            const x = d.dishes.find(y => y.id === id);
            if (x && !m.dishes.some(y => y.name === x.name)) m.dishes.push(x);
          });
        }
        // v13：羊肉卷全部换成牛肉卷（冰箱、菜篮、菜谱、订单都改）
        if (v < 13) {
          const ren = x => { if (x.name === '羊肉卷') x.name = '牛肉卷'; };
          m.fridge.forEach(ren);
          m.basket.forEach(ren);
          m.cart.forEach(ren);
          m.dishes.forEach(x => {
            if (x.name.includes('羊肉卷')) x.name = x.name.replace('羊肉卷', '牛肉卷');
            (x.ingredients || []).forEach(ren);
            if (typeof x.steps === 'string') x.steps = x.steps.replace(/羊肉卷/g, '牛肉卷');
          });
          m.orders.forEach(o => (o.items || []).forEach(it => {
            if (it.name && it.name.includes('羊肉卷')) it.name = it.name.replace('羊肉卷', '牛肉卷');
          }));
          const seen = new Set();
          m.fridge = m.fridge.filter(x => {
            if (x.name !== '牛肉卷') return true;
            if (seen.has(x.name)) return false;
            seen.add(x.name);
            return true;
          });
        }
        // v14：肥牛卷其实也是牛肉卷，统一成一个名字，冰箱只留一条
        if (v < 14) {
          const ren2 = x => { if (x.name === '肥牛卷') x.name = '牛肉卷'; };
          m.fridge.forEach(ren2);
          m.basket.forEach(ren2);
          m.cart.forEach(ren2);
          m.dishes.forEach(x => {
            (x.ingredients || []).forEach(ren2);
            if (typeof x.steps === 'string') x.steps = x.steps.replace(/肥牛卷/g, '牛肉卷');
          });
          m.orders.forEach(o => (o.items || []).forEach(it => {
            if (it.name && it.name.includes('肥牛卷')) it.name = it.name.replace('肥牛卷', '牛肉卷');
          }));
          const seen2 = new Set();
          m.fridge = m.fridge.filter(x => {
            if (x.name !== '牛肉卷') return true;
            if (seen2.has(x.name)) return false;
            seen2.add(x.name);
            return true;
          });
        }
        // v15：内置菜谱全部换成小白详细版做法
        if (v < 15) {
          const byId = {};
          d.dishes.forEach(x => { byId[x.id] = x; });
          m.dishes.forEach(x => {
            if (byId[x.id]) x.steps = byId[x.id].steps;
          });
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
/* 冰箱只记有没有，所以「补进来」就是确保这一行在 */
function addIng(name, extra) {
  if (!findIng(name)) {
    const it = { id: uid(), name, qty: 1, unit: '', storage: '常温', cat: '', bought: todayStr(), expire: '', ...(extra || {}) };
    if (!it.expire) it.expire = addDays(it.bought, shelfLife(it));
    state.fridge.push(it);
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
  addIng(b.name, {
    storage, cat: b.cat || '', bought: todayStr(),
    expire: addDays(todayStr(), shelfLife({ name: b.name, storage, cat: b.cat }))
  });
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
      let badge = '<span class="exp-badge exp-ok">常备</span>';
      if (!state.settings.notifyExpire) badge = '';
      else if (d === null) badge = '<span class="exp-badge exp-ok">常备</span>';
      else if (d < 0) badge = '<span class="exp-badge exp-bad">已过期</span>';
      else if (d === 0) badge = '<span class="exp-badge exp-soon">今天到期</span>';
      else if (d <= 2) badge = `<span class="exp-badge exp-soon">还剩 ${d} 天</span>`;
      else badge = `<span class="exp-badge exp-ok">还剩 ${d} 天</span>`;
      return `<div class="card">
        <div class="fridge-item">
          <div class="mini" style="width:42px;height:42px;border-radius:12px;background:#faf2df;display:flex;align-items:center;justify-content:center;font-size:20px">${x.storage === '冷冻' ? '❄️' : x.storage === '常温' ? '🥫' : '🧊'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600">${esc(x.name)}</div>
            <div class="muted">${esc(x.storage || '常温')}${x.cat ? ' · ' + esc(x.cat) : ''}${x.bought ? ' · 买于 ' + esc(x.bought.slice(5).replace('-', '/')) : ''}</div>
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
  bought.forEach(b => addIng(b.name, {
    storage: '冷藏', cat: '配菜', bought: todayStr(),
    expire: addDays(todayStr(), shelfLife({ name: b.name, storage: '冷藏', cat: '配菜' }))
  }));
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
      state.fridge.push({ id: uid(), name, qty: 1, unit: '', storage, cat: '', bought: todayStr(), expire });
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
