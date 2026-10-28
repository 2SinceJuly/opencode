import { describe, expect, test } from "bun:test"
import { openInAppParentPath, randomTabId, resolveOpenInAppPath } from "./path"

describe("resolveOpenInAppPath", () => {
  test("joins relative paths using the workspace separator", () => {
    expect(resolveOpenInAppPath("/workspace/project", "src/file.ts")).toBe("/workspace/project/src/file.ts")
    expect(resolveOpenInAppPath("C:\\workspace\\project", "src/file.ts")).toBe("C:\\workspace\\project\\src\\file.ts")
  })

  test("preserves absolute POSIX, Windows, and UNC paths", () => {
    expect(resolveOpenInAppPath("/workspace", "/tmp/file.ts")).toBe("/tmp/file.ts")
    expect(resolveOpenInAppPath("C:/workspace", "D:\\src\\file.ts")).toBe("D:\\src\\file.ts")
    expect(resolveOpenInAppPath("C:/workspace", "\\\\server\\share\\file.ts")).toBe("\\\\server\\share\\file.ts")
    expect(resolveOpenInAppPath("C:/workspace", "\\src\\file.ts")).toBe("\\src\\file.ts")
  })
})

describe("openInAppParentPath", () => {
  test("preserves POSIX and Windows roots", () => {
    expect(openInAppParentPath("/file.ts")).toBe("/")
    expect(openInAppParentPath("/workspace/file.ts")).toBe("/workspace")
    expect(openInAppParentPath("C:\\file.ts")).toBe("C:\\")
    expect(openInAppParentPath("C:\\workspace\\file.ts")).toBe("C:\\workspace")
    expect(openInAppParentPath("\\\\server\\share\\file.ts")).toBe("\\\\server\\share")
  })
})

describe("randomTabId", () => {
  test("generates a unique hex id for each launcher tab", () => {
    const ids = new Set(Array.from({ length: 100 }, () => randomTabId()))

    expect(ids.size).toBe(100)

    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{32}$/)
  })

  test("works without crypto.randomUUID, as on plain HTTP origins", () => {
    const randomUUID = crypto.randomUUID

    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true })

    try {
      expect(randomTabId()).toMatch(/^[0-9a-f]{32}$/)
    } finally {
      Object.defineProperty(crypto, "randomUUID", { value: randomUUID, configurable: true })
    }
  })
})
