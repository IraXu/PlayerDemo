<template>
  <svg class="office-print" viewBox="0 0 520 370" fill="none" aria-hidden="true">
    <defs>
      <clipPath id="office-cat-clip"><rect x="100" y="90" width="220" height="220"/></clipPath>
    </defs>
    <g stroke-linecap="round" stroke-linejoin="round">
      <!-- 办公椅：正常尺寸的转椅，窄靠背、薄坐垫和五爪底座，刚好够一只打工猫坐 -->
      <g class="office-chair">
        <path d="M211 307h4v23h-4Z" fill="#9CAFB0" stroke="#86999B" stroke-width="1"/>
        <path d="M213 330 176 343M213 330 250 343M213 330 195 347M213 330 231 347" stroke="#9CAFB0" stroke-width="3.6" stroke-linecap="round"/>
        <circle cx="175" cy="344" r="2.8" fill="#87999B"/>
        <circle cx="251" cy="344" r="2.8" fill="#87999B"/>
        <circle cx="194" cy="348" r="2.8" fill="#87999B"/>
        <circle cx="232" cy="348" r="2.8" fill="#87999B"/>
        <circle cx="213" cy="331" r="4.2" fill="#9CAFB0" stroke="#86999B" stroke-width="1"/>
        <path d="M152 303C145 268 147 224 154 200 159 182 170 171 186 168 197 166 229 166 240 168 256 171 267 182 272 200 279 224 281 268 274 303Z" fill="#C4D8CC" stroke="#A2BCB0" stroke-width="1.3"/>
        <path d="M155 274c8 2 16 3 24 3M271 274c-8 2-16 3-24 3" stroke="#AFC7BB" stroke-width="1.1" fill="none"/>
        <path d="M164 297h98c7 0 12 3 12 7s-5 7-12 7H164c-7 0-12-3-12-7s5-7 12-7Z" fill="#C4D8CC" stroke="#A2BCB0" stroke-width="1.3"/>
        <path d="M164 301c21-3 77-3 98 0" stroke="#AFC7BB" stroke-width="1" fill="none"/>
      </g>
      <!-- 显示器支架 -->
      <path d="M402 238h12v36h-12Z" fill="#B4C9D7"/>
      <path d="M380 274h56l-2 8h-52Z" fill="#B4C9D7" stroke="#9AB4C6" stroke-width="1.2"/>

      <!-- 猫：沿用站内统一的猫咪插画，坐在桌子后面 -->
      <g class="office-cat-bob">
        <g clip-path="url(#office-cat-clip)">
          <g class="office-cat" transform="translate(118 118) scale(1.9)">
            <AnimalArtwork animal="cat" />
          </g>
        </g>
      </g>
      <!-- 痛苦赶工：八字眉、垮嘴、汗滴和眼泪；鼻子保留猫咪原本的小鼻子 -->
      <rect x="203.5" y="227.3" width="19" height="7.9" fill="#F3ECDD"/>
      <path d="M213 224.4v6.4" stroke="#758697" stroke-width="1.3" fill="none"/>
      <path d="M205.8 230.8q3.6-3.6 7.2 0q3.6-3.6 7.2 0" stroke="#9C6B7A" stroke-width="1.7" fill="none"/>
      <path d="M177 196 195 192M249 196 231 192" stroke="#77889A" stroke-width="2.2"/>
      <path d="M183 213q5 2.2 10 0M233 213q5 2.2 10 0" stroke="#C9B9A9" stroke-width="1.2" fill="none" opacity=".85"/>
      <path d="M254 186q7 9 0 13-7-4 0-13Z" fill="#C6DDE9"/>
      <path d="M174 191q-6 8 0 11 6-3 0-11Z" fill="#C6DDE9"/>
      <path d="M242.2 210.8q3.6 5 0 7.2-3.6-2.2 0-7.2Z" fill="#9CC9DD"/>
      <g class="anger-steam" stroke="#C6A9B1" stroke-width="1.6" fill="none" stroke-linecap="round">
        <path d="M211 157q-5-5 0-10t0-8"/>
        <path d="M225 153q-4.5-4.5 0-9t0-7"/>
      </g>
      <g class="anger-mark"><g transform="translate(260 174)">
        <g stroke="#C08E9B" stroke-width="1.8" fill="none" stroke-linecap="round">
          <path d="M-4.4-2.3C-1.5-2.9 1.5-2.9 4.4-2.3"/>
          <path d="M-4.4 2.3C-1.5 1.7 1.5 1.7 4.4 2.3"/>
          <path d="M-2.3-4.4C-2.9-1.5-2.9 1.5-2.3 4.4"/>
          <path d="M2.3-4.4C1.7-1.5 1.7 1.5 2.3 4.4"/>
        </g>
      </g></g>
      <g class="office-think">
        <path d="M105 126h48a10 10 0 0 1 10 10v14a10 10 0 0 1-10 10l9 14-17-14h-40a10 10 0 0 1-10-10v-14a10 10 0 0 1 10-10Z" fill="#FBFCF7" stroke="#D3E1E9" stroke-width="1.2"/>
        <text x="113" y="148.5" fill="#6C8A9E" font-size="9" font-family="'PingFang SC',system-ui,sans-serif">在改了…</text>
      </g>

      <!-- 桌子 -->
      <path d="M56 282h448v9H56Z" fill="#C9CDC4"/>
      <path d="M96 291v56m368-56v56" stroke="#AEBAB9" stroke-width="5"/>

      <!-- 键盘 -->
      <path d="M150 261h158v18H150Z" fill="#EAF1F5" stroke="#B9CEDA" stroke-width="1.2"/>
      <path d="M157 268h144M157 273h144" stroke="#CBDDE7" stroke-width="3.2" stroke-dasharray="5 3"/>
      <!-- 打字爪 -->
      <g class="cat-paw paw-left">
        <path d="M181 240q-5 14 1 26" stroke="#EFE7D7" stroke-width="11" fill="none"/>
        <path d="M178 278q0-13 13-13t13 13Z" fill="#F8F5EB" stroke="#ADB5AC" stroke-width="1.2"/>
        <path d="M185 278v-3m6 3v-3m6 3v-3" stroke="#B9BDB1" stroke-width="1.1"/>
      </g>
      <g class="cat-paw paw-right">
        <path d="M255 240q5 14-1 26" stroke="#EFE7D7" stroke-width="11" fill="none"/>
        <path d="M232 278q0-13 13-13t13 13Z" fill="#F8F5EB" stroke="#ADB5AC" stroke-width="1.2"/>
        <path d="M239 278v-3m6 3v-3m6 3v-3" stroke="#B9BDB1" stroke-width="1.1"/>
      </g>
      <g class="typing-marks" stroke="#8DABBE" stroke-width="2" stroke-linecap="round"><path d="M176 268l-9-2M175 273l-8 3M260 268l9-2M261 273l8 3"/></g>
      <g class="flying-key"><rect x="212" y="250" width="9" height="7" rx="2" fill="#D7E6EF" stroke="#9DB8CA" stroke-width="1.1"/></g>

      <!-- 显示器：VS Code / DeepSeek / Codex 同屏 -->
      <g class="office-monitor">
        <path d="M318 92h186v141a8 8 0 0 1-8 8H326a8 8 0 0 1-8-8Z" fill="#93B1C6" stroke="#7E9DB2" stroke-width="1.5"/>
        <path d="M326 100h170v132H326Z" fill="#F8FAF6"/>
        <path d="M326 100h170v13H326Z" fill="#E3EDF3"/>
        <circle cx="333" cy="106.5" r="1.8" fill="#C5D6DF"/><circle cx="339" cy="106.5" r="1.8" fill="#C5D6DF"/><circle cx="345" cy="106.5" r="1.8" fill="#C5D6DF"/>
        <path d="M352 103h38v10h-38Z" fill="#FBFCF8"/>
        <text x="355" y="110.4" font-size="4.6" fill="#6F8B9D" font-family="ui-monospace,monospace">App.vue</text>
        <text x="394" y="110.4" font-size="4.4" fill="#A8BAC4" font-family="ui-monospace,monospace">cat.ts</text>
        <rect x="452" y="102.5" width="9" height="9" rx="2" fill="#7FA5BE"/>
        <path d="m455.5 105 2 1.7-2 1.7" stroke="#FBFCF8" stroke-width="1.1"/>
        <text x="464" y="110.2" font-size="4" fill="#8299A8" font-family="'PingFang SC',system-ui,sans-serif">VS Code</text>
        <!-- 文件侧栏 -->
        <path d="M326 113h18v119h-18Z" fill="#EDF3F6"/>
        <rect x="330" y="120" width="10" height="10" rx="2" fill="#CBDCE6"/>
        <rect x="330" y="135" width="10" height="10" rx="2" fill="#A9C4D6"/>
        <rect x="330" y="150" width="10" height="10" rx="2" fill="#CBDCE6"/>
        <path d="M330 214h10M330 220h7" stroke="#CBDCE6" stroke-width="2"/>
        <!-- 代码编辑区 -->
        <path d="M344 113h96v119h-96Z" fill="#FCFDF9"/>
        <g fill="#B8C7D0" font-size="3.8" font-family="ui-monospace,monospace">
          <text x="347" y="123">1</text><text x="347" y="133">2</text><text x="347" y="143">3</text><text x="347" y="153">4</text><text x="347" y="163">5</text><text x="347" y="173">6</text><text x="347" y="183">7</text><text x="347" y="193">8</text><text x="347" y="203">9</text><text x="347" y="213">10</text><text x="347" y="223">11</text>
        </g>
        <g stroke-width="2.4">
          <path d="M357 121h24" stroke="#AFC9D9"/>
          <path d="M385 121h20" stroke="#C9D8C4"/>
          <path d="M357 131h12m8 0h22" stroke="#D2C3CB"/>
          <path d="M365 141h32" stroke="#AFC9D9"/>
          <path d="M365 151h18" stroke="#C9D8C4"/>
          <path d="M365 161h28" stroke="#C1D3DE"/>
          <path d="M357 171h14" stroke="#D2C3CB"/>
          <path d="M365 181h36" stroke="#AFC9D9"/>
          <path d="M365 191h22" stroke="#C9D8C4"/>
          <path d="M357 201h40" stroke="#C1D3DE"/>
          <path d="M365 211h26" stroke="#AFC9D9"/>
          <path d="M357 221h30" stroke="#C9D8C4"/>
        </g>
        <rect class="cursor" x="390" y="218" width="2" height="5" fill="#6E93AD"/>
        <!-- DeepSeek / Codex 面板 -->
        <path d="M440 113h56v119h-56Z" fill="#F3F7F4"/>
        <rect x="444" y="117" width="48" height="46" rx="3" fill="#E2EEF6" stroke="#CFE1EC" stroke-width="1"/>
        <path d="M448 124q3-3 6 0t6 0q-1 4-6 4t-6-4Z" fill="#6E93AD"/>
        <text x="463" y="125.5" font-size="4.2" fill="#5E8199" font-family="'PingFang SC',system-ui,sans-serif">deepseek</text>
        <rect x="448" y="130" width="36" height="9" rx="2" fill="#FBFCF8"/>
        <path d="M451 134h24" stroke="#BBD2E0" stroke-width="2"/>
        <rect x="448" y="142" width="29" height="7" rx="2" fill="#FBFCF8" opacity=".8"/>
        <rect x="448" y="153" width="40" height="7" rx="2" fill="#FBFCF8" stroke="#CFE0EA" stroke-width=".8"/>
        <path d="m482 156.5 2 1.4-2 1.4" stroke="#7FA0B6" stroke-width="1"/>
        <rect x="444" y="169" width="48" height="52" rx="3" fill="#EFF4EC" stroke="#DEE8D8" stroke-width="1"/>
        <path d="m451 176 1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3Z" fill="#8FAE8B"/>
        <text x="457" y="180.5" font-size="4.2" fill="#7D977A" font-family="'PingFang SC',system-ui,sans-serif">codex</text>
        <path d="M448 186h38M448 192h30M448 198h34" stroke="#DCE7D8" stroke-width="2.2"/>
        <rect x="448" y="207" width="40" height="3" rx="1.5" fill="#DDE7DA"/>
        <rect x="448" y="207" width="24" height="3" rx="1.5" fill="#9BB697"/>
        <text x="448" y="217" font-size="3.4" fill="#9AAE97" font-family="'PingFang SC',system-ui,sans-serif">生成中…</text>
        <!-- 未读角标 -->
        <g class="notification"><rect x="482" y="92" width="26" height="14" rx="7" fill="#C09CA9"/><text x="495" y="101.6" font-size="6" fill="#FFFDF8" text-anchor="middle" font-family="system-ui">99+</text></g>
      </g>

      <!-- 企微消息卡：从屏幕上方溢出来 -->
      <g class="office-wecom">
        <rect x="262" y="58" width="92" height="58" rx="6" fill="#FBFCF7" stroke="#D6E3EA" stroke-width="1.2"/>
        <rect x="268" y="64" width="9" height="9" rx="2.4" fill="#96B8A0"/>
        <path d="M270.5 68.5h4" stroke="#FBFCF7" stroke-width="1.2"/>
        <text x="281" y="71.5" font-size="6.5" fill="#6B8676" font-family="'PingFang SC',system-ui,sans-serif">企微</text>
        <circle cx="344" cy="66" r="5" fill="#C09CA9"/>
        <text x="344" y="68.2" font-size="3.8" fill="#FFFDF8" text-anchor="middle" font-family="system-ui">99+</text>
        <rect x="268" y="77" width="50" height="10" rx="3" fill="#F1F6F1"/>
        <path d="M272 82h34" stroke="#BFD3C3" stroke-width="2"/>
        <rect x="286" y="91" width="52" height="10" rx="3" fill="#DDEBE1"/>
        <path d="M290 96h36" stroke="#A9C4AF" stroke-width="2"/>
      </g>

      <!-- 聊天窗口溢出到屏幕边缘 -->
      <g class="office-chat office-chat-a">
        <path d="M281 140h44a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-12l-9 10v-10h-23a8 8 0 0 1-8-8v-12a8 8 0 0 1 8-8Z" fill="#FBFCF7" stroke="#D6E3EA" stroke-width="1.2"/>
        <text x="287" y="157" font-size="8" fill="#6C8A9E" font-family="'PingFang SC',system-ui,sans-serif">你来一下</text>
      </g>
      <g class="office-chat office-chat-b">
        <rect x="300" y="180" width="64" height="28" rx="9" fill="#DDEBE1" stroke="#C4D8CB" stroke-width="1.2"/>
        <text x="312" y="198" font-size="8" fill="#5E7F6A" font-family="'PingFang SC',system-ui,sans-serif">需求又变了</text>
        <circle cx="356" cy="187" r="3.2" fill="#C09CA9"/>
      </g>

      <!-- 桌面小物 -->
      <path d="M78 260h20l-3 22H81Z" fill="#AABFAD"/>
      <path d="M88 258v-24" stroke="#8CA991" stroke-width="2"/>
      <path d="M88 246q-15-1-14-14 14 0 14 14m0-8q1-15 13-17 2 13-13 17" fill="#B6C8B5"/>
      <g transform="rotate(-3 333 274)">
        <path d="M314 264h38v20h-38Z" fill="#FBFCF7" stroke="#D8E3E9" stroke-width="1.1"/>
        <text x="318" y="270" font-size="3.8" fill="#A5B6C0" font-family="'PingFang SC',system-ui,sans-serif">需求 v3</text>
        <path d="M318 275h26M318 279h20" stroke="#C6D5DD" stroke-width="1.6"/>
      </g>
      <g transform="rotate(3 369 270)">
        <path d="M356 258h26v22h-26Z" fill="#F6F1DC" stroke="#E4DCC2" stroke-width="1"/>
        <path d="m373 258 9 9h-9Z" fill="#EAE3CA"/>
        <text x="360" y="266" font-size="4" fill="#A79A78" font-family="'PingFang SC',system-ui,sans-serif">TODO</text>
        <path d="M360 271h17M360 275h12" stroke="#D8CFB4" stroke-width="1.6"/>
      </g>
      <path d="M444 256h20v22h-20Z" fill="#EFF2E4" stroke="#BCC5B0" stroke-width="1.2"/>
      <path d="M464 261c11-1 11 12 0 11" stroke="#BCC5B0" stroke-width="2"/>
      <path class="office-steam" d="M452 249q-6-6 0-12" stroke="#B4C5CA" stroke-width="1.5"/>
      <g class="office-hotfix"><g transform="rotate(7 502 142)">
        <path d="M492 130h21v18h-21Z" fill="#F6F1DC" stroke="#E0D7BA" stroke-width="1"/>
        <text x="495" y="141.5" font-size="3.8" fill="#A79A78" font-family="'PingFang SC',system-ui,sans-serif">hotfix</text>
        <path d="M495 145h11" stroke="#DED4B6" stroke-width="1.4"/>
      </g></g>
      <!-- 提示条：从屏幕顶边挤出来 -->
      <g class="office-toast"><g transform="rotate(-2 440 94)">
        <rect x="412" y="86" width="56" height="16" rx="8" fill="#F7ECEF" stroke="#E3CDD3" stroke-width="1"/>
        <circle cx="421" cy="94" r="2.6" fill="#C09CA9"/>
        <text x="427" y="96.2" font-size="6.5" fill="#96697C" font-family="'PingFang SC',system-ui,sans-serif">构建失败</text>
      </g></g>
    </g>
  </svg>
</template>
<script setup lang="ts">
import AnimalArtwork from './AnimalArtwork.vue'
</script>
<style scoped>
.office-print{display:block;width:100%;height:auto;overflow:visible}
.office-cat-bob{transform-box:fill-box;transform-origin:50% 100%;animation:catWork 3.2s ease-in-out infinite}
.office-cat :deep(.companion-eye){transform-box:fill-box;transform-origin:center;animation:catBlink 7s ease-in-out infinite}
.office-cat :deep(.companion-tail){transform-box:fill-box;transform-origin:right center;animation:tailFlick 1.8s ease-in-out infinite}
.office-think{transform-box:fill-box;transform-origin:center;animation:floatSoft 6s ease-in-out infinite}
.anger-steam{animation:steam 2.8s ease-in-out infinite}
.anger-mark{transform-box:fill-box;transform-origin:center;animation:angerPulse 1.4s ease-in-out infinite}
.cat-paw{transform-box:fill-box;transform-origin:50% 20%;animation:typing .32s ease-in-out infinite}
.paw-right{animation-delay:-.16s}
.office-monitor{transform-box:fill-box;transform-origin:center bottom;animation:monitorShake 1s ease-in-out infinite}
.notification{transform-box:fill-box;transform-origin:center;animation:badgePulse 2.4s ease-in-out infinite}
.office-wecom{transform-box:fill-box;transform-origin:center;animation:floatSoft 4.8s ease-in-out infinite}
.office-chat{transform-box:fill-box;transform-origin:center;animation:floatSoft 5.4s ease-in-out infinite}
.office-chat-b{animation-delay:-1.8s}
.typing-marks{animation:typingFlash .32s steps(2) infinite}
.flying-key{animation:keyFly 1.6s ease-out infinite}
.office-steam{animation:steam 3s ease-in-out infinite}
.cursor{animation:cursorBlink 1.1s steps(1) infinite}
.office-hotfix{transform-box:fill-box;transform-origin:center;animation:floatSoft 6.4s ease-in-out infinite}
.office-toast{transform-box:fill-box;transform-origin:center;animation:floatSoft 5.6s ease-in-out infinite;animation-delay:-1.4s}
@keyframes typing{50%{transform:translateY(-6px) rotate(-3deg)}}
@keyframes catWork{50%{transform:translateY(1.5px)}}
@keyframes catBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
@keyframes tailFlick{50%{transform:rotate(10deg)}}
@keyframes monitorShake{50%{transform:rotate(.4deg)}}
@keyframes angerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}
@keyframes badgePulse{50%{transform:scale(1.08)}}
@keyframes floatSoft{50%{transform:translateY(-2px)}}
@keyframes typingFlash{50%{opacity:.15}}
@keyframes keyFly{0%{opacity:0;transform:translateY(18px)}25%{opacity:1}85%,100%{opacity:0;transform:translate(6px,-12px) rotate(26deg)}}
@keyframes steam{50%{opacity:.25;transform:translateY(-4px)}}
@keyframes cursorBlink{50%{opacity:0}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}.flying-key{opacity:0}}
</style>
