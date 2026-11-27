# 小猫互动通知（纯 GitHub Pages）

## 本次已验证的情况

2026-11-27 的无消息诊断确认：线上点击能触发 POST，现有 webhook 有效，企微可以解析 `text/plain` 请求中的 JSON。实际点击样本约 700 字节，低于官方 markdown 的 4096 字节上限。没有证据证明这次未收件是 CORS 阻止请求或 Content-Type 错误。

确定的原实现缺陷是：把 `sendBeacon()` 的 `true` 当作送达，而且吞掉网络异常、直接清空已出队事件。`true` 仅表示浏览器接受排队；请求发出并不代表企微业务接受。

继续保持纯 GitHub Pages，不新增后端、Worker 或转发端点。企微未提供可读的 CORS 响应，网页使用 `no-cors` 直连时无法读取 `errcode`；所以没有“送达成功”状态，只有“已提交但未确认”。

## 发送与离页处理

- 可见页面中，1.2 秒窗口内的点击合并，正常提交至少间隔 4 秒，使用 `fetch` + `credentials:'omit'` + `keepalive:true`。
- 请求超时 10 秒。遇到可观察到的网络失败时，每批最多重试 2 次，分别退避 4 秒和 8 秒；不会因为新点击重置旧批次的次数。
- 每批在形成时冻结互动数、累计数和时间。新点击形成独立批次，重试沿用原内容，避免异步查询 IP 时计数错位。
- `visibilitychange:hidden` / `pagehide` 时立即同步提交尚未发出的批次，不等 IP 查询、合并窗口或下一个异步任务。
- 离页时优先 `sendBeacon`；未接受排队或抛错时立即尝试 keepalive fetch。已进入 fetch 的批次不会因为离页再发送一次；hidden 和 pagehide 连续触发也不会重复提交。
- 等待 IP 查询的批次会被离页处理同步接管；查询随后返回时不会再发送该批次。
- 如果错误在隐藏状态才被发现，保留内存中的待重试批次，页面回到前台后再尝试；页面彻底销毁以后无法保证异步回调或重试继续运行。没有引入跨页面持久队列，也不保证离页消息送达。

同一个机器人还与树洞共用，所有访问者及功能的请求会共同计入限额。客户端无法读取企微的限流、失效等业务拒绝结果，也无法据此重试。

## 查看诊断

浏览器开发工具 Console 中：

```js
JSON.parse(sessionStorage.getItem('companion-report:last-delivery') || 'null')
```

状态包括：

- `pending`：在本地队列或正在提交；不是送达证明。
- `unconfirmed`：fetch 已返回 opaque 响应，或离页请求已被 beacon 接受排队；企微业务结果不可读。
- `failed`：网络异常或超时。`detail` 说明错误及是否还会有限重试。

`batchId`、`attempts`、`interactions` 分别标识批次、已尝试提交次数和该批形成时的累计互动数。诊断也通过 `companion-report:delivery` 自定义事件广播，不包含 webhook key 或完整通知内容。

## 本地回归

推荐 Node 24（与部署构建一致）：

```sh
node scripts/check-companion-report.cjs
```

脚本隔离浏览器、网络和时钟，不发群消息；覆盖合并、退避/上限、超时、离页即时提交、IP 查询接管、在途去重、并发计数、beacon 失败兜底和回前台重试。

参考资料：

- 企业微信机器人官方文档：`https://developer.work.weixin.qq.com/document/path/91770`
- MDN sendBeacon 返回值：`https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon`
