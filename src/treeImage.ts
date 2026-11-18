/**
 * 树洞图片：压缩到企业微信机器人可接受的尺寸，并计算上传所需的 md5。
 */

export interface TreeImage {
  base64: string
  md5: string
  preview: string
  width: number
  height: number
  size: number
}

const MAX_SIDE = 1600
const TARGET_BYTES = 1.5 * 1024 * 1024
const MAX_BYTES = 2 * 1024 * 1024
const MAX_SOURCE_BYTES = 20 * 1024 * 1024

const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]

const K = new Uint32Array(64)
for (let i = 0; i < 64; i++) {
  K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
}

function leHex(value: number) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** 计算二进制内容的 md5（企业微信 image 消息要求 base64 编码前的 md5） */
export function md5Hex(bytes: Uint8Array): string {
  const bitLength = bytes.length * 8
  const paddedLength = (((bytes.length + 8) >> 6) + 1) * 64
  const buffer = new Uint8Array(paddedLength)
  buffer.set(bytes)
  buffer[bytes.length] = 0x80

  const view = new DataView(buffer.buffer)
  view.setUint32(paddedLength - 8, bitLength >>> 0, true)
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476
  const words = new Uint32Array(16)

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i++) {
      words[i] = view.getUint32(offset + i * 4, true)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number

      if (i < 16) {
        f = (b & c) | (~b & d)
        g = i
      } else if (i < 32) {
        f = (d & b) | (~d & c)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * i) % 16
      }

      const next = d
      d = c
      c = b
      const sum = (a + f + K[i] + words[g]) >>> 0
      const rotated = ((sum << SHIFTS[i]) | (sum >>> (32 - SHIFTS[i]))) >>> 0
      b = (b + rotated) >>> 0
      a = next
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  return [a0, b0, c0, d0].map(leHex).join('')
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('这张图片读不出来，换一张试试'))
    }
    image.src = url
  })
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('图片处理失败'))
    reader.readAsDataURL(blob)
  })
}

export async function prepareTreeImage(file: File): Promise<TreeImage> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('请选择 JPG / PNG / WebP 图片')
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('图片太大了，请换一张 20MB 以内的')
  }

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  let width = Math.max(1, Math.round(image.naturalWidth * scale))
  let height = Math.max(1, Math.round(image.naturalHeight * scale))
  let quality = 0.82
  let blob: Blob | null = null

  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('图片处理失败')

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })
    if (!blob) throw new Error('图片处理失败')

    if (blob.size <= TARGET_BYTES) break
    width = Math.max(1, Math.round(width * 0.82))
    height = Math.max(1, Math.round(height * 0.82))
    quality = Math.max(0.55, quality - 0.07)
  }

  if (!blob || blob.size > MAX_BYTES) {
    throw new Error('图片压缩后还是太大，换一张试试')
  }

  const buffer = await blob.arrayBuffer()
  const preview = await blobToDataUrl(blob)

  return {
    base64: preview.split(',')[1],
    md5: md5Hex(new Uint8Array(buffer)),
    preview,
    width,
    height,
    size: blob.size,
  }
}
