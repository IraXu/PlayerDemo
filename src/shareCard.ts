import { fortuneFor } from './fortune'
import { copyFor, type ThemeName } from './theme'

/**
 * 把当前画面 + 今日猫签合成一张适合分享的竖版卡片。
 * 画面来自播放器截图（dataURL），整个合成都在本地 Canvas 完成。
 */

export interface ShareCardOptions {
  screenshot: string
  theme: ThemeName
  date?: Date
}

const WIDTH = 1080
const HEIGHT = 1440
const FONT_STACK =
  '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", -apple-system, sans-serif'

interface CardColors {
  bgTop: string
  bgBottom: string
  accent: string
  levelBg: string
  levelText: string
  seal: string
}

const COLORS: Record<ThemeName, CardColors> = {
  cat: {
    bgTop: '#f9f4e7',
    bgBottom: '#eee3cc',
    accent: '#19c8b9',
    levelBg: '#e6f9f6',
    levelText: '#0e7f75',
    seal: '猫',
  },
  bear: {
    bgTop: '#fbf2e0',
    bgBottom: '#efdfc2',
    accent: '#d99a3a',
    levelBg: '#fbeed6',
    levelText: '#a9761d',
    seal: '熊',
  },
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function dateStamp(date: Date) {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

function dateLabel(date: Date) {
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${week}`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function drawPaw(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotate = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotate)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(0, size * 0.2, size * 0.3, size * 0.23, 0, 0, Math.PI * 2)
  ctx.fill()
  const toes: Array<[number, number, number]> = [
    [-0.39, -0.14, 0.14],
    [-0.14, -0.3, 0.14],
    [0.14, -0.3, 0.14],
    [0.39, -0.14, 0.14],
  ]
  toes.forEach(([tx, ty, tr]) => {
    ctx.beginPath()
    ctx.arc(tx * size, ty * size, tr * size, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.restore()
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('画面读取失败'))
    image.src = src
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceW = image.naturalWidth || image.width
  const sourceH = image.naturalHeight || image.height
  const scale = Math.max(width / sourceW, height / sourceH)
  const cropW = width / scale
  const cropH = height / scale
  const cropX = (sourceW - cropW) / 2
  const cropY = (sourceH - cropH) / 2
  ctx.drawImage(image, cropX, cropY, cropW, cropH, x, y, width, height)
}

/** 按字符折行，最多 maxLines 行，超出用省略号收尾 */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const lines: string[] = []
  let current = ''

  for (const char of text) {
    const next = current + char
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current)
      current = char
      if (lines.length === maxLines) break
    } else {
      current = next
    }
  }
  if (lines.length < maxLines && current) lines.push(current)
  if (lines.length === maxLines && current && lines[maxLines - 1] !== current) {
    let last = lines[maxLines - 1]
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1)
    lines[maxLines - 1] = `${last}…`
  }
  return lines
}

export async function composeShareCard({
  screenshot,
  theme,
  date = new Date(),
}: ShareCardOptions): Promise<Blob> {
  const colors = COLORS[theme]
  const text = copyFor(theme)
  const fortune = fortuneFor(theme, date)
  const image = await loadImage(screenshot)

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('卡片绘制失败')

  // 背景：奶油色渐变 + 淡淡爪印
  const background = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  background.addColorStop(0, colors.bgTop)
  background.addColorStop(1, colors.bgBottom)
  ctx.fillStyle = background
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  drawPaw(ctx, 120, 120, 92, 'rgba(121, 79, 39, 0.06)', -0.3)
  drawPaw(ctx, 968, 210, 70, 'rgba(121, 79, 39, 0.05)', 0.35)
  drawPaw(ctx, 92, 1310, 78, 'rgba(121, 79, 39, 0.05)', 0.2)
  drawPaw(ctx, 982, 1332, 96, 'rgba(121, 79, 39, 0.06)', -0.25)

  // 卡片主体
  ctx.save()
  ctx.shadowColor = 'rgba(121, 79, 39, 0.18)'
  ctx.shadowBlur = 38
  ctx.shadowOffsetY = 20
  ctx.fillStyle = '#fffaf0'
  roundRect(ctx, 56, 56, 968, 1328, 52)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = '#e7d8bd'
  ctx.lineWidth = 3
  roundRect(ctx, 56, 56, 968, 1328, 52)
  ctx.stroke()

  // 截图：16:9 居中裁切
  const photoX = 92
  const photoY = 108
  const photoW = 896
  const photoH = 504
  ctx.save()
  roundRect(ctx, photoX, photoY, photoW, photoH, 36)
  ctx.clip()
  drawCover(ctx, image, photoX, photoY, photoW, photoH)
  ctx.restore()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.lineWidth = 4
  roundRect(ctx, photoX, photoY, photoW, photoH, 36)
  ctx.stroke()

  // 画面左下角的时间胶囊
  const stamp = dateStamp(date)
  ctx.font = `700 26px ${FONT_STACK}`
  const stampW = ctx.measureText(stamp).width + 44
  ctx.fillStyle = 'rgba(255, 250, 240, 0.9)'
  roundRect(ctx, photoX + 26, photoY + photoH - 78, stampW, 52, 26)
  ctx.fill()
  ctx.fillStyle = '#794f27'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(stamp, photoX + 26 + stampW / 2, photoY + photoH - 52)

  // 标题与副标题
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#5a4227'
  ctx.font = `800 52px ${FONT_STACK}`
  ctx.fillText(text.title, WIDTH / 2, 712)

  ctx.fillStyle = '#9f927d'
  ctx.font = `500 24px ${FONT_STACK}`
  ctx.fillText(text.subtitle, WIDTH / 2, 762)

  // 分割线 + 中间小爪印
  ctx.strokeStyle = '#e3d3b6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(286, 812)
  ctx.lineTo(486, 812)
  ctx.moveTo(594, 812)
  ctx.lineTo(794, 812)
  ctx.stroke()
  drawPaw(ctx, 540, 812, 40, colors.accent, 0)

  // 今日签卡片
  const cardX = 124
  const cardY = 854
  const cardW = 832
  const cardH = 344
  ctx.fillStyle = '#fffdf6'
  roundRect(ctx, cardX, cardY, cardW, cardH, 34)
  ctx.fill()
  ctx.save()
  ctx.setLineDash([12, 9])
  ctx.strokeStyle = '#e3d3b6'
  ctx.lineWidth = 2.5
  roundRect(ctx, cardX, cardY, cardW, cardH, 34)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = '#9f927d'
  ctx.font = `600 22px ${FONT_STACK}`
  ctx.fillText(theme === 'bear' ? '今日熊签' : '今日猫签', WIDTH / 2, cardY + 48)

  // 吉签等级
  ctx.font = `800 40px ${FONT_STACK}`
  const levelW = Math.max(150, ctx.measureText(fortune.level).width + 64)
  const pillY = cardY + 74
  ctx.fillStyle = colors.levelBg
  roundRect(ctx, (WIDTH - levelW) / 2, pillY, levelW, 66, 33)
  ctx.fill()
  ctx.fillStyle = colors.levelText
  ctx.textBaseline = 'middle'
  ctx.fillText(fortune.level, WIDTH / 2, pillY + 35)

  // 签文
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#5a4227'
  ctx.font = `500 28px ${FONT_STACK}`
  const lines = wrapLines(ctx, fortune.line, 680, 2)
  lines.forEach((line, index) => {
    ctx.fillText(line, WIDTH / 2, cardY + 212 + index * 44)
  })

  // 今日建议
  ctx.font = `500 22px ${FONT_STACK}`
  const todo = `今天可以：${fortune.todo}`
  const todoW = Math.min(cardW - 120, ctx.measureText(todo).width + 48)
  ctx.fillStyle = '#fffaf0'
  roundRect(ctx, (WIDTH - todoW) / 2, cardY + 276, todoW, 48, 24)
  ctx.fill()
  ctx.strokeStyle = '#e8dcc8'
  ctx.lineWidth = 2
  roundRect(ctx, (WIDTH - todoW) / 2, cardY + 276, todoW, 48, 24)
  ctx.stroke()
  ctx.fillStyle = '#8f734f'
  ctx.textBaseline = 'middle'
  ctx.fillText(todo, WIDTH / 2, cardY + 300)

  // 印章
  ctx.save()
  ctx.translate(cardX + cardW - 74, cardY + 46)
  ctx.rotate(-0.14)
  ctx.strokeStyle = 'rgba(208, 91, 91, 0.6)'
  ctx.lineWidth = 3
  roundRect(ctx, -30, -30, 60, 60, 12)
  ctx.stroke()
  ctx.fillStyle = '#d05b5b'
  ctx.font = `800 28px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(colors.seal, 0, 1)
  ctx.restore()

  // 页脚
  ctx.font = `600 24px ${FONT_STACK}`
  const footerText = text.footer
  const footerTextW = ctx.measureText(footerText).width
  const pawSize = 30
  const footerGap = 14
  const footerStart = (WIDTH - (pawSize + footerGap + footerTextW)) / 2
  drawPaw(ctx, footerStart + pawSize / 2, 1236, pawSize, 'rgba(121, 79, 39, 0.3)', -0.1)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#8f734f'
  ctx.fillText(footerText, footerStart + pawSize + footerGap, 1260)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#b3a58e'
  ctx.font = `500 20px ${FONT_STACK}`
  ctx.fillText(dateLabel(date), WIDTH / 2, 1306)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('卡片生成失败'))),
      'image/jpeg',
      0.92,
    )
  })
}
