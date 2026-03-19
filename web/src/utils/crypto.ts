/**
 * 前端密码加密工具
 * 使用 SHA-256 对密码进行哈希处理，避免明文传输
 */
import CryptoJS from 'crypto-js'

/**
 * 对密码进行 SHA-256 哈希
 * @param password 原始密码
 * @returns 哈希后的十六进制字符串
 */
export async function hashPassword(password: string): Promise<string> {
  // 使用 crypto-js 库，兼容性更好，支持所有现代浏览器
  const hash = CryptoJS.SHA256(password)
  return hash.toString(CryptoJS.enc.Hex)
}

/**
 * 加密密码对象（用于登录和初始化）
 * @param password 原始密码
 * @returns 加密后的密码字符串
 */
export async function encryptPassword(password: string): Promise<string> {
  return await hashPassword(password)
}