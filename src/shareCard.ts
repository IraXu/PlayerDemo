import { fortuneFor } from './fortune'
import type { ThemeName } from './theme'

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

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function dateStamp(date: Date) {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
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

export async function composeShareCard({ screenshot, theme, date = new Date() }: ShareCardOptions): Promise<Blob> {
  const image = await loadImage(screenshot)
  const fortune = fortuneFor(theme, date)
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('卡片绘制失败')
  ctx.fillStyle = '#FAFAF5'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#8FA8BA'
  ctx.font = `400 21px ${FONT_STACK}`
  ctx.fillText('THE EVERYDAY OFFICE / 017', 76, 94)
  ctx.textAlign = 'right'
  ctx.fillText(dateStamp(date), 1004, 94)
  ctx.strokeStyle = '#D6E3EC'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(76, 122); ctx.lineTo(1004, 122); ctx.stroke()
  ctx.save()
  roundRect(ctx, 76, 165, 928, 522, 8)
  ctx.clip()
  drawCover(ctx, image, 76, 165, 928, 522)
  ctx.restore()
  ctx.textAlign = 'left'
  ctx.fillStyle = '#56788F'
  ctx.font = `400 49px ${FONT_STACK}`
  ctx.fillText('和猫同事，一起待一会儿。', 76, 785)
  ctx.fillStyle = '#9AAEBC'
  ctx.font = `400 23px ${FONT_STACK}`
  ctx.fillText('A LITTLE COMPANY, A LITTLE BREAK.', 76, 834)
  ctx.fillStyle = '#EAF1F6'
  roundRect(ctx, 76, 903, 928, 310, 6)
  ctx.fill()
  ctx.fillStyle = '#91AABC'
  ctx.font = `400 20px ${FONT_STACK}`
  ctx.fillText(theme === 'bear' ? '今日熊签' : '今日猫签', 110, 955)
  ctx.fillStyle = '#759AB4'
  ctx.font = `400 38px ${FONT_STACK}`
  ctx.fillText(fortune.level, 110, 1019)
  ctx.fillStyle = '#64869D'
  ctx.font = `400 29px ${FONT_STACK}`
  wrapLines(ctx, fortune.line, 830, 2).forEach((line, i) => ctx.fillText(line, 110, 1071 + i * 45))
  ctx.fillStyle = '#8CA6B7'
  ctx.font = `400 21px ${FONT_STACK}`
  wrapLines(ctx, '今天可以：' + fortune.todo, 830, 2).forEach((line, i) => ctx.fillText(line, 110, 1161 + i * 30))
  ctx.strokeStyle = '#D6E3EC'
  ctx.beginPath(); ctx.moveTo(76, 1282); ctx.lineTo(1004, 1282); ctx.stroke()
  ctx.fillStyle = '#91A7B6'
  ctx.font = `400 21px ${FONT_STACK}`
  ctx.fillText('十七的逗猫室', 76, 1338)
  ctx.textAlign = 'right'
  ctx.fillText('GOOD COMPANY, EVERY DAY.', 1004, 1338)
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('卡片生成失败')), 'image/jpeg', .92))
}
