<template>
  <div
    class="page"
    :class="{ immersive: pseudoFullscreen || isFullscreen, touch: touchMode, 'bear-day': isBear, teasing: teasing }"
  >
    <div class="bg-decor" aria-hidden="true">
      <svg class="deco-sprite" width="0" height="0">
        <defs>
          <symbol id="cute-cat-sit" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M86 96c10 1 15-5 13-13-1-5-5-8-10-8" />
              <path d="M46 78c-9 3-15 11-15 20 0 7 5 11 13 11h30c8 0 13-4 13-11 0-9-6-17-15-20" />
              <path d="M49 78c7 4 15 4 22 0" />
              <path d="M38 54c0-14 10-24 22-24s22 10 22 24c0 13-10 22-22 22S38 67 38 54Z" />
              <path d="M42 39 38 23 55 33" />
              <path d="M65 33 82 23 78 39" />
              <path d="M49 54c2-3 5-3 7 0" />
              <path d="M64 54c2-3 5-3 7 0" />
              <path d="M58 60 62 60 60 63Z" />
              <path d="M60 63c0 2-3 2-4 1M60 63c0 2 3 2 4 1" />
              <path d="M47 60 37 58M47 65 37 66M73 60 83 58M73 65 83 66" />
              <path d="M52 109v-7M68 109v-7" />
            </g>
          </symbol>
          <symbol id="cute-cat-peek" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 92h100" />
              <path d="M91 92c10-1 14-8 11-16" />
              <path d="M36 88c0-18 11-30 24-30s24 12 24 30" />
              <path d="M41 64 37 47 54 58" />
              <path d="M66 58 83 47 79 64" />
              <path d="M48 72c2-3 5-3 7 0" />
              <path d="M65 72c2-3 5-3 7 0" />
              <path d="M58 78 62 78 60 81Z" />
              <path d="M60 81c0 2-3 2-4 1M60 81c0 2 3 2 4 1" />
              <path d="M47 78 38 76M47 82 38 84M73 78 82 76M73 82 82 84" />
              <path d="M43 92c0-5 4-8 8-8s8 3 8 8" />
              <path d="M61 92c0-5 4-8 8-8s8 3 8 8" />
            </g>
          </symbol>
          <!-- 小熊日限定：把背景里的小猫换成小熊 -->
          <symbol id="cute-bear-sit" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="36" cy="34" r="13" />
              <circle cx="84" cy="34" r="13" />
              <path d="M42 78c-9 4-14 12-14 20 0 7 5 10 14 10h36c9 0 14-3 14-10 0-8-5-16-14-20" />
              <path d="M45 78c8 4 22 4 30 0" />
              <path d="M60 32c17 0 28 12 28 27 0 12-11 21-28 21S32 71 32 59c0-15 11-27 28-27Z" />
              <ellipse cx="60" cy="63" rx="14" ry="10" />
              <path d="M56 59h8l-4 4z" />
              <path d="M60 63c0 2-3 2-4 1M60 63c0 2 3 2 4 1" />
              <path d="M49 51c2-2 4-2 6 0M65 51c2-2 4-2 6 0" />
              <path d="M46 108v-7M74 108v-7" />
            </g>
          </symbol>
          <symbol id="cute-bear-peek" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 92h100" />
              <circle cx="42" cy="55" r="12" />
              <circle cx="78" cy="55" r="12" />
              <path d="M38 90c0-15 10-26 22-26s22 11 22 26" />
              <ellipse cx="60" cy="76" rx="13" ry="9" />
              <path d="M56 72h8l-4 4z" />
              <path d="M60 76c0 2-3 2-4 1M60 76c0 2 3 2 4 1" />
              <path d="M50 67c2-2 4-2 6 0M64 67c2-2 4-2 6 0" />
              <path d="M43 92c0-5 4-8 8-8s8 3 8 8" />
              <path d="M61 92c0-5 4-8 8-8s8 3 8 8" />
            </g>
          </symbol>
          <symbol id="deco-honey" viewBox="0 0 120 120">
            <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M36 40h48l-7 58c-1 8-7 13-17 13s-16-5-17-13l-7-58Z" />
              <path d="M32 32h56v8H32z" />
              <path d="M48 62h24M46 78h28" opacity=".65" />
            </g>
          </symbol>
        </defs>
      </svg>
      <svg class="deco deco-cat deco-cat-main" viewBox="0 0 120 120">
        <use :href="isBear ? '#cute-bear-peek' : '#cute-cat-peek'" />
      </svg>
      <svg class="deco deco-cat deco-cat-side" viewBox="0 0 120 120">
        <use :href="isBear ? '#cute-bear-sit' : '#cute-cat-sit'" />
      </svg>
      <svg class="deco deco-cat deco-cat-top" viewBox="0 0 120 120">
        <use :href="isBear ? '#cute-bear-peek' : '#cute-cat-peek'" />
      </svg>
      <PawPrintIcon class="deco deco-paw deco-paw-1" :size="34" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-2" :size="30" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-3" :size="28" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-4" :size="26" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-5" :size="24" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-6" :size="22" color="currentColor" />
      <PawPrintIcon class="deco deco-paw deco-paw-7" :size="20" color="currentColor" />
      <FishIcon class="deco deco-fish deco-fish-1" :size="50" color="currentColor" />
      <FishIcon class="deco deco-fish deco-fish-2" :size="34" color="currentColor" />
      <BoneIcon v-if="!isBear" class="deco deco-bone deco-bone-1" :size="28" color="currentColor" />
      <BoneIcon v-if="!isBear" class="deco deco-bone deco-bone-2" :size="22" color="currentColor" />
      <template v-else>
        <svg class="deco deco-bone deco-bone-1" width="30" height="30" viewBox="0 0 120 120">
          <use href="#deco-honey" />
        </svg>
        <svg class="deco deco-bone deco-bone-2" width="24" height="24" viewBox="0 0 120 120">
          <use href="#deco-honey" />
        </svg>
      </template>
      <HeartIcon class="deco deco-heart deco-heart-1" :size="26" color="currentColor" />
      <HeartIcon class="deco deco-heart deco-heart-2" :size="20" color="currentColor" />
      <StarIcon class="deco deco-star deco-star-1" :size="24" color="currentColor" />
      <CloudIcon class="deco deco-cloud deco-cloud-1" :size="120" color="currentColor" />
      <CloudIcon class="deco deco-cloud deco-cloud-2" :size="88" color="currentColor" />
    </div>

    <header class="masthead">
      <div class="brand">
        <span v-if="isBear" class="bear-badge">小熊日限定</span>
        <Title class="brand-title" size="middle" :color="isBear ? 'app-orange' : 'app-teal'">
          {{ copy.title }}
        </Title>
        <p class="brand-sub">
          <PawPrintIcon :size="14" color="currentColor" />
          {{ copy.subtitle }}
        </p>
      </div>
      <Tooltip :title="copy.mascotTip" placement="bottom-end" variant="island">
        <button class="page-cat" type="button" :aria-label="copy.mascotTip" @click="openEgg">
          <svg v-if="isBear" class="cat-mascot bear-mascot" viewBox="0 0 120 110" fill="none" aria-hidden="true">
            <circle cx="60" cy="58" r="47" fill="#FBF1DE" stroke="#D8C19A" stroke-width="2.5" />
            <circle cx="33" cy="30" r="14" fill="#C98F52" stroke="#794F27" stroke-width="3.5" />
            <circle cx="87" cy="30" r="14" fill="#C98F52" stroke="#794F27" stroke-width="3.5" />
            <circle cx="33" cy="30" r="6.5" fill="#EBC08C" />
            <circle cx="87" cy="30" r="6.5" fill="#EBC08C" />
            <path d="M38 76c0-11 10-18 22-18s22 7 22 18c0 11-10 18-22 18s-22-7-22-18Z" fill="#C98F52" stroke="#794F27" stroke-width="3.5" />
            <path d="M60 18c19 0 33 14 33 32 0 19-15 32-33 32S27 69 27 50c0-18 14-32 33-32Z" fill="#D9A468" stroke="#794F27" stroke-width="3.5" />
            <ellipse cx="60" cy="60" rx="19" ry="14.5" fill="#F6DFBC" />
            <ellipse class="cat-eye" cx="47" cy="46" rx="3.2" ry="4.2" fill="#2A2A2A" />
            <ellipse class="cat-eye" cx="73" cy="46" rx="3.2" ry="4.2" fill="#2A2A2A" />
            <circle cx="48" cy="44.5" r="1" fill="#fff" />
            <circle cx="74" cy="44.5" r="1" fill="#fff" />
            <circle cx="37" cy="57" r="3.2" fill="#F4A6A4" opacity=".5" />
            <circle cx="83" cy="57" r="3.2" fill="#F4A6A4" opacity=".5" />
            <path d="M55 54h10l-5 5.5z" fill="#5A3A22" />
            <path d="M60 59.5c0 3-4 3-5 1M60 59.5c0 3 4 3 5 1" stroke="#794F27" stroke-width="1.8" stroke-linecap="round" />
            <path d="M44 76c8 5 24 5 32 0" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round" />
            <path class="cat-scarf" d="M46 78c-6 3-8 9-6 15" stroke="#2A9D8F" stroke-width="6" stroke-linecap="round" />
            <ellipse cx="48" cy="97" rx="9" ry="6" fill="#F6DFBC" stroke="#794F27" stroke-width="3" />
            <ellipse cx="72" cy="97" rx="9" ry="6" fill="#F6DFBC" stroke="#794F27" stroke-width="3" />
            <path d="M45 97v3M48 96.6v3.6M51 97v3M69 97v3M72 96.6v3.6M75 97v3" stroke="#C9A87C" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          <svg v-else class="cat-mascot" viewBox="0 0 120 110" fill="none" aria-hidden="true">
            <circle cx="60" cy="58" r="47" fill="#F7F3DF" stroke="#D4C4A8" stroke-width="2.5" />
            <path class="cat-tail" d="M42 95c-15 2-25-7-21-20 2-8 10-12 16-8" stroke="#794F27" stroke-width="4" stroke-linecap="round" />
            <path d="M42 92c-10-4-14-16-8-26 5-8 16-12 26-12s21 4 26 12c6 10 2 22-8 26-8 4-28 4-36 0Z" fill="#F7CBD3" stroke="#794F27" stroke-width="3.5" />
            <path d="M40 34 36 8 57 20c2-1 4-1 6 0l21-12-4 26c4 4 6 9 6 15 0 12-11 21-26 24-15-3-26-12-26-24 0-6 2-11 6-15Z" fill="#F7CBD3" stroke="#794F27" stroke-width="3.5" stroke-linejoin="round" />
            <path d="M43 27 41 14 53 21Z" fill="#F4A6A4" />
            <path d="M77 27 79 14 67 21Z" fill="#F4A6A4" />
            <ellipse class="cat-eye" cx="50" cy="46" rx="3.2" ry="4.2" fill="#2A2A2A" />
            <ellipse class="cat-eye" cx="70" cy="46" rx="3.2" ry="4.2" fill="#2A2A2A" />
            <circle cx="51" cy="44.5" r="1" fill="#fff" />
            <circle cx="71" cy="44.5" r="1" fill="#fff" />
            <circle cx="45" cy="54" r="3" fill="#F4A6A4" opacity=".55" />
            <circle cx="75" cy="54" r="3" fill="#F4A6A4" opacity=".55" />
            <path d="M56 54 64 54 60 58Z" fill="#F4A6A4" />
            <path d="M60 58c0 3-4 3-5 1M60 58c0 3 4 3 5 1" stroke="#794F27" stroke-width="1.8" stroke-linecap="round" />
            <path d="M44 52 30 49M44 58 30 57M76 52 90 49M76 58 90 57" stroke="#794F27" stroke-width="1.8" stroke-linecap="round" />
            <path d="M48 68c8 5 26 5 34 0" stroke="#2A9D8F" stroke-width="7" stroke-linecap="round" />
            <path class="cat-scarf" d="M50 70c-6 3-8 9-6 15" stroke="#2A9D8F" stroke-width="6" stroke-linecap="round" />
            <ellipse cx="50" cy="98" rx="9" ry="6" fill="#FFF1F2" stroke="#794F27" stroke-width="3" />
            <ellipse cx="72" cy="98" rx="9" ry="6" fill="#FFF1F2" stroke="#794F27" stroke-width="3" />
            <path d="M46 98c0 2 2 3 4 3M76 98c0 2-2 3-4 3" stroke="#794F27" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <HeartIcon class="page-cat-heart" :size="17" color="#ff8fb1" />
        </button>
      </Tooltip>
    </header>

    <Card class="player">
      <div
        ref="stageRef"
        :class="['stage', { live: isLive, pseudo: pseudoFullscreen, rotated }]"
        @click="onStageTap"
        @dblclick="onStageDoubleClick"
      >
        <div ref="containerRef" class="video"></div>

        <transition name="tease-fade">
          <div v-if="isLive && teasing" class="tease-overlay" aria-hidden="true">
            <svg class="tease-ribbon ribbon-a" viewBox="0 0 800 240" preserveAspectRatio="none">
              <path d="M-40 60C120-10 260 130 420 70S680-20 840 60" />
            </svg>
            <svg class="tease-ribbon ribbon-b" viewBox="0 0 800 240" preserveAspectRatio="none">
              <path d="M-40 40C140 120 260 10 430 80S660 150 840 50" />
            </svg>
            <svg class="tease-ribbon ribbon-c" viewBox="0 0 800 240" preserveAspectRatio="none">
              <path d="M-40 120C120 40 280 170 440 90S700 20 840 100" />
            </svg>

            <div class="tease-confetti">
              <span v-for="piece in confetti" :key="piece.id" :style="piece.style"></span>
            </div>

            <div class="tease-wand">
              <svg viewBox="0 0 200 200" fill="none">
                <g class="tease-wand-swing">
                  <!-- 奶油色衬底：任何画面上都能看清轮廓 -->
                  <path
                    d="M183 17 88 112"
                    stroke="#fff7e6"
                    stroke-width="15"
                    stroke-linecap="round"
                    opacity=".9"
                  />
                  <path
                    d="M88 112c-8 9-15 16-21 22"
                    stroke="#fff7e6"
                    stroke-width="8"
                    stroke-linecap="round"
                    opacity=".9"
                  />
                  <path
                    d="M69 131C58 134 48 142 41 153L35 148 37 158 29 158 34 166 27 169 34 175 28 181 38 181 40 189 48 181 53 188 58 177C68 161 73 144 69 131Z"
                    fill="none"
                    stroke="#fff7e6"
                    stroke-width="12"
                    stroke-linejoin="round"
                    opacity=".9"
                  />

                  <!-- 棒身 -->
                  <path d="M183 17 88 112" stroke="#8a5a2b" stroke-width="8" stroke-linecap="round" />
                  <path
                    d="M179 21 92 108"
                    stroke="#c99a5e"
                    stroke-width="2.6"
                    stroke-linecap="round"
                    opacity=".85"
                  />
                  <path d="M181 19 164 36" stroke="#19c8b9" stroke-width="9" stroke-linecap="round" />

                  <!-- 绳子和羽毛 -->
                  <path
                    d="M88 112c-8 9-15 16-21 22"
                    stroke="#8a5a2b"
                    stroke-width="2.6"
                    stroke-linecap="round"
                  />
                  <g class="tease-wand-fluff">
                    <path
                      d="M69 131C58 134 48 142 41 153L35 148 37 158 29 158 34 166 27 169 34 175 28 181 38 181 40 189 48 181 53 188 58 177C68 161 73 144 69 131Z"
                      fill="#f7a8b8"
                      stroke="#d97a93"
                      stroke-width="2.6"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M69 131C61 146 53 163 45 178"
                      stroke="#d97a93"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <path
                      d="M64 141C59 139 54 136 49 132M58 152C52 150 47 147 42 143M52 163C46 161 41 158 36 154"
                      stroke="#d97a93"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      opacity=".75"
                    />
                    <path
                      d="M65 137c-6 5-11 12-15 20"
                      stroke="#ffd3dc"
                      stroke-width="4"
                      stroke-linecap="round"
                      opacity=".8"
                    />
                    <circle cx="69" cy="131" r="3.4" fill="#d97a93" />
                  </g>

                  <!-- 铃铛 -->
                  <path d="M69 131 82 138" stroke="#8a5a2b" stroke-width="2.2" />
                  <circle cx="85" cy="144" r="5.6" fill="#ffd166" stroke="#b98a1c" stroke-width="2" />
                  <circle cx="83" cy="142" r="1.6" fill="#fff7e6" />

                  <!-- 小闪光 -->
                  <path
                    class="wand-spark spark-1"
                    d="M118 44l2.2 5.4 5.4 2.2-5.4 2.2-2.2 5.4-2.2-5.4-5.4-2.2 5.4-2.2Z"
                    fill="#ffd166"
                  />
                  <circle class="wand-spark spark-2" cx="48" cy="112" r="3" fill="#6fd3c7" />
                  <circle class="wand-spark spark-3" cx="96" cy="164" r="2.4" fill="#f7a8b8" />
                </g>
              </svg>
            </div>

            <div class="tease-hud">
              <div class="tease-chip">
                <PawPrintIcon :size="12" color="currentColor" />
                <span>{{ copy.teasingText }}</span>
              </div>
              <div class="tease-track">
                <span
                  class="tease-fill"
                  :style="{ animationDuration: `${TEASE_DURATION_MS}ms` }"
                ></span>
              </div>
            </div>
          </div>
        </transition>

        <div v-if="rotateHint" class="rotate-hint">
          <SmartphoneIcon :size="16" color="currentColor" />
          <span>请将手机横过来观看</span>
        </div>

        <div v-if="!isLive" class="placeholder" :class="{ idle: status === 'idle' }">
          <button
            v-if="status === 'idle'"
            class="play-btn"
            type="button"
            :aria-label="copy.playAria"
            :title="copy.playAria"
            @click.stop="openPlayback"
          >
            <PlayIcon :size="30" color="currentColor" />
          </button>
          <span v-else-if="status === 'error'" class="glyph">
            <VideoOffIcon :size="32" color="currentColor" />
          </span>
          <SpinnerIcon v-else class="spinner" :size="34" color="#19c8b9" />

          <h1>{{ placeholderTitle }}</h1>
          <p>{{ placeholderText }}</p>

          <Button v-if="status === 'error'" type="primary" size="small" class="retry" @click="connect">
            <template #icon><RefreshIcon :size="16" color="currentColor" /></template>
            重新连接
          </Button>
        </div>

        <button
          v-if="isLive"
          class="stop-btn"
          type="button"
          aria-label="关闭播放"
          :title="copy.stopTitle"
          @click.stop="closePlayback"
        >
          <CloseIcon :size="18" color="currentColor" />
        </button>

        <div v-if="isLive" class="toolbar" @click.stop>
          <Tabs
            class="quality-tabs"
            :items="qualityItems"
            :model-value="String(stream)"
            aria-label="清晰度"
            @change="onQualityChange"
          />

          <span class="divider"></span>

          <Tooltip :title="muted ? '开启声音' : '静音'" placement="top" variant="island">
            <Button
              class="icon"
              type="text"
              size="small"
              :aria-label="muted ? '开启声音' : '静音'"
              @click="toggleMute"
            >
              <template #icon>
                <VolumeXIcon v-if="muted" :size="19" color="currentColor" />
                <Volume2Icon v-else :size="19" color="currentColor" />
              </template>
            </Button>
          </Tooltip>

          <input
            class="slider"
            type="range"
            min="0"
            max="100"
            step="1"
            aria-label="音量"
            :value="volumePercent"
            :style="{ '--fill': `${volumePercent}%` }"
            @input="onVolumeInput"
          />

          <Tooltip title="截图" placement="top" variant="island">
            <Button class="icon" type="text" size="small" aria-label="截图" @click="takeScreenshot">
              <template #icon><CameraIcon :size="19" color="currentColor" /></template>
            </Button>
          </Tooltip>

          <Tooltip :title="interactHint" placement="top" variant="island">
            <Button
              class="action"
              size="small"
              :class="{ busy: interacting || teasing, cooling: cooldownLeft > 0 }"
              :disabled="interactDisabled"
              @click="triggerInteract"
            >
              <template #icon>
                <span class="action-icon">
                  <svg class="wand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 20 15 9"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M15 9c1.3-1.5 2.9-2.6 4.7-3.1"
                      stroke="currentColor"
                      stroke-width="1.3"
                      stroke-linecap="round"
                    />
                    <g class="wand-tip">
                      <path
                        d="M16.8 6.4c1.1-2 2.8-3.3 4.8-3.6 1-.1 1.9.4 2.3 1.4-.2 2-1.3 3.8-3 4.9-1.4 1-3 .9-4.2-.2-.4-.9-.4-1.7.1-2.5Z"
                        fill="#f7a8b8"
                        stroke="#d97a93"
                        stroke-width="1.1"
                        stroke-linejoin="round"
                      />
                      <circle cx="17.6" cy="10.9" r="1.3" fill="#ffd166" stroke="#b98a1c" stroke-width=".7" />
                    </g>
                  </svg>
                </span>
              </template>
              <span class="action-label">{{ interactText }}</span>
            </Button>
          </Tooltip>

          <Tooltip :title="fullActive ? '退出全屏' : '全屏'" placement="top" variant="island">
            <Button class="icon" type="text" size="small" aria-label="全屏" @click="toggleFullscreen">
              <template #icon>
                <MinimizeIcon v-if="fullActive" :size="19" color="currentColor" />
                <MaximizeIcon v-else :size="19" color="currentColor" />
              </template>
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>

    <Collapse v-model:expanded="infoOpen" class="info">
      <template #question>
        <span class="info-question">
          <PawPrintIcon class="info-cat" :size="20" color="#19c8b9" />
          <span class="info-name">{{ device?.name || '设备信息' }}</span>
        </span>
      </template>
      <dl class="info-list">
        <div class="info-cell">
          <dt><QrCodeIcon :size="14" color="currentColor" /> DID</dt>
          <dd class="mono">{{ device?.did || did }}</dd>
        </div>
        <div class="info-cell">
          <dt><IdCardIcon :size="14" color="currentColor" /> License</dt>
          <dd class="mono">{{ device?.license || '—' }}</dd>
        </div>
        <div class="info-cell">
          <dt><CpuIcon :size="14" color="currentColor" /> 固件版本</dt>
          <dd>{{ device?.version || '—' }}</dd>
        </div>
        <div class="info-cell">
          <dt><HardDriveIcon :size="14" color="currentColor" /> MAC</dt>
          <dd class="mono">{{ device?.mac || '—' }}</dd>
        </div>
        <div class="info-cell">
          <dt><WifiIcon :size="14" color="currentColor" /> 所连 WiFi</dt>
          <dd>{{ device?.ssid || '—' }}</dd>
        </div>
      </dl>
    </Collapse>

    <footer class="meta">
      <span class="dot" :class="statusKey"></span>
      <span class="state">{{ statusLabel }}</span>
      <span class="grow"></span>
      <Tooltip title="刷新画面" placement="top" variant="island">
        <Button class="ghost" type="text" size="small" aria-label="刷新" @click="connect">
          <template #icon><RefreshIcon :size="17" color="currentColor" /></template>
        </Button>
      </Tooltip>
    </footer>

    <Footer class="page-footer" :text="copy.footer" />

    <div class="corner-slot" :class="{ open: cornerOpen }">
      <transition name="corner">
        <div v-if="cornerOpen" class="corner-menu" role="menu" :aria-label="copy.cornerTitle">
          <p class="corner-title">
            <PawPrintIcon :size="14" color="#19c8b9" />
            {{ copy.cornerTitle }}
          </p>

          <button class="corner-item" type="button" role="menuitem" @click="openFortuneFromMenu">
            <span class="corner-icon fortune">
              <StickyNoteIcon :size="17" color="currentColor" />
            </span>
            <span class="corner-text">
              <strong>{{ copy.fortuneTitle }}</strong>
              <small>抽一支今天的签</small>
            </span>
          </button>

          <button class="corner-item" type="button" role="menuitem" @click="openHuntFromMenu">
            <span class="corner-icon hunt">
              <SearchIcon :size="17" color="currentColor" />
            </span>
            <span class="corner-text">
              <strong>{{ huntFound ? copy.huntFoundLabel : copy.huntLabel }}</strong>
              <small>{{ huntFound ? copy.huntFoundDesc : copy.huntDesc }}</small>
            </span>
          </button>

          <button class="corner-item" type="button" role="menuitem" @click="openShareFromMenu">
            <span class="corner-icon share">
              <ShareIcon :size="17" color="currentColor" />
            </span>
            <span class="corner-text">
              <strong>{{ copy.shareLabel }}</strong>
              <small>{{ copy.shareDesc }}</small>
            </span>
          </button>

          <button class="corner-item" type="button" role="menuitem" @click="openTreeFromMenu">
            <span class="corner-icon tree">
              <TreeIcon :size="17" color="currentColor" />
            </span>
            <span class="corner-text">
              <strong>树洞</strong>
              <small>把心事悄悄投进去</small>
            </span>
          </button>
        </div>
      </transition>

      <button
        class="corner-fab"
        type="button"
        :aria-expanded="cornerOpen"
        :aria-label="copy.cornerAria"
        @click="toggleCorner"
      >
        <PawPrintIcon :size="30" color="currentColor" />
      </button>
    </div>

    <DailyFortune ref="fortuneRef" />
    <FindTheCat v-model:found="huntFound" @found="onCatFound" />

    <Modal v-model:open="treeOpen" variant="default" :typewriter="false" :width="460">
      <div class="tree-hole">
        <div class="tree-head">
          <TreeIcon :size="38" color="#19c8b9" />
          <h2>树洞</h2>
          <Typewriter :speed="55" :trigger="treeOpen" @done="treeTyped = true">
            <p :class="{ typed: treeTyped }">{{ copy.treeDesc }}</p>
          </Typewriter>
        </div>
        <textarea
          v-model="treeMessage"
          class="tree-input"
          maxlength="500"
          rows="5"
          placeholder="写下你的心事…"
          aria-label="树洞留言"
        ></textarea>

        <div class="tree-image">
          <input
            ref="treeFileRef"
            class="tree-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="onTreeImageChange"
          />
          <div v-if="treeImageLoading" class="tree-image-state">图片处理中…</div>
          <div v-else-if="treeImage" class="tree-image-preview">
            <img :src="treeImage.preview" alt="待发送的图片预览" />
            <div class="tree-image-info">
              <strong>已添加 1 张图片</strong>
              <span>
                {{ treeImage.width }}×{{ treeImage.height }} ·
                {{ Math.round(treeImage.size / 1024) }} KB
              </span>
            </div>
            <button
              class="tree-image-remove"
              type="button"
              aria-label="移除图片"
              @click="removeTreeImage"
            >
              ×
            </button>
          </div>
          <button v-else class="tree-image-add" type="button" @click="treeFileRef?.click()">
            <ImageIcon :size="16" color="currentColor" />
            添加图片（可选）
          </button>
          <p v-if="treeImageError" class="tree-error tree-image-error">{{ treeImageError }}</p>
        </div>

        <div class="tree-meta">
          <span>{{ treeMessage.length }}/500</span>
          <span v-if="treeError" class="tree-error">{{ treeError }}</span>
        </div>
      </div>
      <template #footer>
        <Button type="default" @click="treeOpen = false">先不投了</Button>
        <Button
          class="tree-submit"
          type="primary"
          :loading="treeSending"
          :disabled="!treeMessage.trim() || treeSending || treeImageLoading"
          @click="submitTreeHole"
        >
          投入树洞
        </Button>
      </template>
    </Modal>

    <Modal v-model:open="shareOpen" variant="default" :typewriter="false" :width="420">
      <div class="share-card">
        <div class="share-head">
          <ShareIcon :size="24" color="#19c8b9" />
          <h2>{{ copy.shareLabel }}</h2>
          <p>把此刻的{{ isBear ? '小熊' : '猫猫' }}做成一张小卡片</p>
        </div>

        <div v-if="shareBusy" class="share-loading">
          <SpinnerIcon class="spinner" :size="30" color="#19c8b9" />
          <span>正在做成小卡片…</span>
        </div>
        <div v-else-if="shareUrl" class="share-preview">
          <img :src="shareUrl" alt="分享卡片预览" />
        </div>

        <p class="share-tip">{{ copy.shareCardTip }}</p>
      </div>
      <template #footer>
        <Button type="default" @click="shareOpen = false">先不分享</Button>
        <Button type="primary" class="share-save" :disabled="!shareUrl" @click="saveShareCard">
          保存图片
        </Button>
        <Button
          v-if="canNativeShare"
          type="primary"
          class="share-send"
          :disabled="!shareUrl"
          @click="shareCardNative"
        >
          分享给朋友
        </Button>
      </template>
    </Modal>

    <transition name="fade">
      <div v-if="toast" class="toast" role="status" aria-live="polite">{{ toast }}</div>
    </transition>

    <transition name="egg-fade">
      <div v-if="eggOpen" class="egg-overlay" role="dialog" aria-modal="true" aria-label="给十七的彩蛋" @click.self="closeEgg">
        <span
          v-for="word in eggWords"
          :key="word.id"
          class="egg-word"
          aria-hidden="true"
          :style="{
            left: word.left + '%',
            '--size': word.size + 'px',
            '--rot': word.rot + 'deg',
            '--delay': word.delay + 's',
            '--dur': word.duration + 's',
            '--alpha': word.alpha,
          }"
          >娇娇</span
        >
        <figure
          v-for="item in eggPhotos"
          :key="item.id"
          class="egg-photo"
          :style="{
            left: item.left + '%',
            top: item.top + '%',
            '--w': item.width + 'px',
            '--rot': item.rot + 'deg',
            '--spin': item.spin + 'deg',
            '--delay': item.delay + 's',
            '--dur': item.duration + 's',
          }"
        >
          <img :src="eggPhoto" alt="" draggable="false" />
        </figure>
        <div class="egg-note">
          <HeartIcon :size="30" color="#ff8fb1" />
          <p>给十七：<br />{{ copy.eggWish }}</p>
        </div>
        <button class="egg-close" type="button" aria-label="关闭" @click="closeEgg">
          <CloseIcon :size="20" color="currentColor" />
        </button>
      </div>
    </transition>

    <CompanionCat />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, Card, Collapse, Footer, Modal, Tabs, Title, Tooltip, Typewriter } from 'animal-island-vue'
import {
  BoneIcon,
  CameraIcon,
  CloseIcon,
  CloudIcon,
  CpuIcon,
  FishIcon,
  HardDriveIcon,
  HeartIcon,
  IdCardIcon,
  ImageIcon,
  MaximizeIcon,
  MinimizeIcon,
  PawPrintIcon,
  PlayIcon,
  QrCodeIcon,
  RefreshIcon,
  SearchIcon,
  ShareIcon,
  SmartphoneIcon,
  SpinnerIcon,
  StarIcon,
  StickyNoteIcon,
  TreeIcon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon,
  WifiIcon,
} from 'naive-icons-vue'
import {
  interact,
  LIGHT_DURATION_MS,
  queryDevice,
  queryStream,
  type DeviceInfo,
  type StreamInfo,
} from './api'
import eggPhoto from './assets/easter-egg.jpg'
import {
  buildTreeHoleMessage,
  getClientInfo,
  getNetworkInfoWithTimeout,
  loadNetworkInfo,
} from './clientInfo'
import { prepareTreeImage, type TreeImage } from './treeImage'
import { composeShareCard } from './shareCard'
import { loadPlayerSdk } from './playerSdk'
import { copy, isBear, theme } from './theme'
import CompanionCat from './components/CompanionCat.vue'
import DailyFortune from './components/DailyFortune.vue'
import FindTheCat from './components/FindTheCat.vue'

const did = '1200010180ee9bea'
const TREE_WEBHOOK = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ab1da84d-6f0f-4d9f-8f7b-73ea0dc9db3b'

const containerRef = ref<HTMLElement>()
const stageRef = ref<HTMLElement>()
const status = ref<'idle' | 'loading' | 'switching' | 'playing' | 'error'>('idle')
const errorMsg = ref('')
const QUALITY_KEY = 'cat-stream-quality'

/** 记住上次清晰度；手机上默认高清，减少软解压力 */
function initialQuality(): 0 | 1 {
  try {
    const saved = localStorage.getItem(QUALITY_KEY)
    if (saved === '0' || saved === '1') return saved === '1' ? 1 : 0
  } catch {
    /* 隐私模式下忽略 */
  }
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return coarse || cores <= 4 || memory <= 4 ? 1 : 0
}

const stream = ref<0 | 1>(initialQuality())
const qualityItems = [
  { key: '0', label: '超清' },
  { key: '1', label: '高清' },
]
const muted = ref(true)
const volumePercent = ref(60)
const fps = ref(0)
const resolution = ref<{ width: number; height: number } | null>(null)
const videoCodec = ref('—')
const toast = ref('')
const isFullscreen = ref(false)
const pseudoFullscreen = ref(false)
const rotated = ref(false)
const rotateHint = ref(false)
const device = ref<DeviceInfo | null>(null)
const interacting = ref(false)
// 逗猫棒动画时长：和硬件侧的互动窗口保持一致
const teasing = ref(false)
const TEASE_DURATION_MS = LIGHT_DURATION_MS
// 逗完歇一会儿，避免对面被反复打扰
const cooldownLeft = ref(0)
const COOLDOWN_MS = 30_000

// 画面里的彩纸屑：位置和节奏在启动时随机一次，避免每次渲染都跳
const CONFETTI_COLORS = ['#f7a8b8', '#ffd166', '#6fd3c7', '#f4b183', '#9db7f0']
const confetti = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  style: {
    '--x': `${4 + Math.random() * 90}%`,
    '--delay': `${(Math.random() * 2.6).toFixed(2)}s`,
    '--dur': `${(2.4 + Math.random() * 2).toFixed(2)}s`,
    '--rot': `${Math.round(Math.random() * 360)}deg`,
    '--size': `${(6 + Math.random() * 5).toFixed(1)}px`,
    '--color': CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  } as Record<string, string>,
}))
// 右下角小角落菜单
const cornerOpen = ref(false)
const huntFound = ref(false)
const fortuneRef = ref<{ openNote: () => void } | null>(null)
// 触屏设备不展示悬浮提示，避免提示浮层干扰点击
const touchMode = ref(false)
// 设备信息默认折叠
const infoOpen = ref(false)
// 彩蛋
const eggOpen = ref(false)
// 树洞
const treeOpen = ref(false)
const treeMessage = ref('')
const treeSending = ref(false)
const treeImage = ref<TreeImage | null>(null)
const treeImageLoading = ref(false)
const treeImageError = ref('')
const treeFileRef = ref<HTMLInputElement | null>(null)
const treeError = ref('')
const treeTyped = ref(false)
// 分享卡片
const shareOpen = ref(false)
const shareBusy = ref(false)
const shareUrl = ref('')
const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
let shareBlob: Blob | null = null
interface EggPhotoItem {
  id: number
  left: number
  top: number
  width: number
  rot: number
  spin: number
  delay: number
  duration: number
}
interface EggWordItem {
  id: number
  left: number
  size: number
  rot: number
  delay: number
  duration: number
  alpha: number
}
const eggPhotos = ref<EggPhotoItem[]>([])
const eggWords = ref<EggWordItem[]>([])

const isLive = computed(() => status.value === 'playing')
const fullActive = computed(() => isFullscreen.value || pseudoFullscreen.value)
const statusKey = computed(() =>
  status.value === 'playing' ? 'ok' : status.value === 'error' ? 'bad' : 'wait',
)
const statusLabel = computed(() => {
  if (status.value === 'playing') return copy.value.liveStatus
  if (status.value === 'error') return '未连接'
  if (status.value === 'idle') return copy.value.idleStatus
  return status.value === 'switching' ? '切换中' : '连接中'
})
const placeholderTitle = computed(() => {
  if (status.value === 'error') return copy.value.errorTitle
  if (status.value === 'idle') return copy.value.playTitle
  return status.value === 'switching' ? copy.value.switchingTitle : copy.value.loadingTitle
})
const placeholderText = computed(() => {
  if (status.value === 'error') return errorMsg.value || copy.value.errorText
  if (status.value === 'idle') return copy.value.playText
  return status.value === 'switching' ? copy.value.switchingText : copy.value.loadingText
})
const interactDisabled = computed(
  () => interacting.value || teasing.value || cooldownLeft.value > 0,
)
const interactText = computed(() => {
  if (interacting.value || teasing.value) return copy.value.interactingLabel
  if (cooldownLeft.value > 0) return copy.value.cooldownLabel
  return copy.value.interactLabel
})
const interactHint = computed(() => {
  if (teasing.value) return copy.value.teasingTip
  if (cooldownLeft.value > 0) return copy.value.cooldownTip
  return copy.value.interactTip
})

const MAX_RECONNECT_ATTEMPTS = 4
const RECONNECT_MAX_DELAY = 12_000
const HIDDEN_SUSPEND_MS = 3 * 60_000

let player: HMPlayerInstance | null = null
let resizeObserver: ResizeObserver | null = null
let videoGuard: MutationObserver | null = null
let watchdogTimer: ReturnType<typeof setTimeout> | null = null
let toastTimer: ReturnType<typeof setTimeout> | null = null
let teaseEndTimer: ReturnType<typeof setTimeout> | null = null
let cooldownTimer: ReturnType<typeof setInterval> | null = null
let rotateHintTimer: ReturnType<typeof setTimeout> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let hiddenSuspendTimer: ReturnType<typeof setTimeout> | null = null
const redrawTimers: Array<ReturnType<typeof setTimeout>> = []
// 用户是否还想继续看直播：手动关闭后不再自动重连
let wantLive = false
let reconnectAttempt = 0
let reconnecting = false
// 后台挂久了主动停流，回来时再恢复
let suspendedByHidden = false

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2000)
}

/** 非关键请求让路首屏：空闲时再查设备信息 */
function runWhenIdle(task: () => void) {
  const win = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  }
  if (win.requestIdleCallback) win.requestIdleCallback(task, { timeout: 2500 })
  else window.setTimeout(task, 800)
}

// ==================== 播放器 ====================
function resetMeta() {
  fps.value = 0
  videoCodec.value = '—'
  resolution.value = null
}

function applyVideoFix(video: HTMLVideoElement) {
  video.controls = false
  if (video.hasAttribute('controls')) video.removeAttribute('controls')
  video.muted = muted.value
  video.defaultMuted = muted.value
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('autoplay', '')
  if (muted.value) video.setAttribute('muted', '')
  else video.removeAttribute('muted')
  video.style.setProperty('width', '100%', 'important')
  video.style.setProperty('height', '100%', 'important')
  const played = video.play()
  if (played) played.catch(() => undefined)
}

function setupVideoGuard(el: HTMLElement) {
  const existing = el.querySelector('video')
  if (existing) applyVideoFix(existing as HTMLVideoElement)

  videoGuard?.disconnect()
  videoGuard = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'controls') {
        applyVideoFix(m.target as HTMLVideoElement)
        continue
      }
      m.addedNodes.forEach((node) => {
        const target = node as HTMLElement
        if (target.nodeType !== 1) return
        if (target.tagName === 'VIDEO') {
          applyVideoFix(target as HTMLVideoElement)
        } else if (target.querySelector) {
          const video = target.querySelector('video')
          if (video) applyVideoFix(video as HTMLVideoElement)
        }
      })
    }
  })
  videoGuard.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['controls'] })
}

function resizePlayer() {
  if (!player || !containerRef.value) return
  const { clientWidth, clientHeight } = containerRef.value
  try {
    player.resizeView(0, 0, Math.max(1, clientWidth), Math.max(1, clientHeight))
  } catch {
    /* 播放器 worker 尚未初始化完成时忽略这次尺寸同步 */
  }
}

/** 首帧出来后再监听尺寸变化，避免向还没初始化的 worker 发送 resize */
function attachResizeObserver(el: HTMLElement) {
  if (resizeObserver) return
  resizeObserver = new ResizeObserver(() => resizePlayer())
  resizeObserver.observe(el)
}

async function waitForStableSize(el: HTMLElement) {
  for (let i = 0; i < 24; i++) {
    if (el.clientWidth >= 240 && el.clientHeight >= 120) return
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
}

function clearRedrawTimers() {
  redrawTimers.forEach((timer) => clearTimeout(timer))
  redrawTimers.length = 0
}

function forceRedraw() {
  if (!player || !containerRef.value) return
  clearRedrawTimers()
  const run = () => {
    if (!player || !containerRef.value) return
    try {
      resizePlayer()
      const video = containerRef.value.querySelector('video') as HTMLVideoElement | null
      if (video && video.paused) {
        video.controls = false
        video.play().catch(() => undefined)
      }
    } catch {
      /* ignore */
    }
  }
  ;[0, 120, 320].forEach((delay) => redrawTimers.push(setTimeout(run, delay)))
}

function applyAudioState() {
  if (!player) return
  try {
    if (muted.value) player.mute()
    else {
      player.unMute()
      player.setVolume(volumePercent.value)
    }
  } catch {
    /* ignore */
  }
}

async function startPlayer(info: StreamInfo, streamId: number) {
  await nextTick()
  const el = containerRef.value
  if (!el) throw new Error('播放器容器未就绪')
  await waitForStableSize(el)

  await loadPlayerSdk()

  const instance = new window.HMWebPlayer({
    container: el,
    x: 0,
    y: 0,
    width: el.clientWidth || 960,
    height: el.clientHeight || 540,
    renderMode: 'mse',
    decoderMode: 'soft-simd',
    audioEngine: 'worklet',
    useWorkerForMSE: true,
    useOffScreenCanvasRender: false,
    retryCnt: 0,
  })
  player = instance

  setupVideoGuard(el)

  instance.on('state', ({ state }) => {
    if (player !== instance) return
    if (state === 2 || state === 4) {
      status.value = 'playing'
      reconnectAttempt = 0
      stopWatchdog()
      attachResizeObserver(el)
      forceRedraw()
      applyAudioState()
    } else if (state === 5) {
      handleStreamInterruption('播放通道已中断，正在重连…')
    }
  })

  instance.on('videoInfo', ({ vtype, width, height }) => {
    if (player !== instance) return
    videoCodec.value = vtype === 2 ? 'H.265' : 'H.264'
    resolution.value = { width, height }
  })

  instance.on('stats', (stats) => {
    if (player !== instance) return
    fps.value = stats.vFramerate || stats.yuvFramerate || stats.vRemuxFramerate || 0
    if (status.value !== 'playing' && (stats.vFramerate > 0 || stats.yuvFramerate > 0)) {
      status.value = 'playing'
      reconnectAttempt = 0
      stopWatchdog()
      attachResizeObserver(el)
    }
  })

  instance.on('error', () => {
    if (player !== instance) return
    handleStreamInterruption('拉流异常，正在重连…')
  })

  resizeObserver?.disconnect()
  resizeObserver = null

  instance.startHMLiveStream(
    '',
    did,
    info.ws_url,
    info.resource_id,
    Number(info.enc_type) || 49,
    info.enc_key,
    info.enc_load,
    0,
    streamId,
    0,
    0,
  )

  applyAudioState()
}

async function destroyPlayer() {
  stopWatchdog()
  clearRedrawTimers()
  resizeObserver?.disconnect()
  resizeObserver = null
  videoGuard?.disconnect()
  videoGuard = null

  const instance = player
  player = null
  if (instance) {
    try {
      await instance.destroy()
    } catch {
      /* ignore */
    }
  }
  if (containerRef.value) containerRef.value.innerHTML = ''
}

function startWatchdog() {
  stopWatchdog()
  watchdogTimer = setTimeout(() => {
    watchdogTimer = null
    if (status.value !== 'loading' && status.value !== 'switching') return
    handleStreamInterruption('连接超时，正在重试…')
  }, 10_000)
}

function stopWatchdog() {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer)
    watchdogTimer = null
  }
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function clearHiddenSuspendTimer() {
  if (hiddenSuspendTimer) {
    clearTimeout(hiddenSuspendTimer)
    hiddenSuspendTimer = null
  }
}

/** 直播中途断开：保持“还想看”的意图，按指数退避自动重连 */
function handleStreamInterruption(message: string) {
  if (!wantLive || reconnecting) return
  stopWatchdog()
  status.value = 'loading'
  errorMsg.value = ''
  showToast(message)
  void destroyPlayer()
  scheduleReconnect()
}

function scheduleReconnect() {
  if (!wantLive || reconnectTimer) return
  if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
    status.value = 'error'
    errorMsg.value = '画面没有连上，稍后再试试吧'
    showToast(errorMsg.value)
    return
  }
  const delay = Math.min(RECONNECT_MAX_DELAY, 1500 * 2 ** reconnectAttempt)
  reconnectAttempt += 1
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    void reconnectStream()
  }, delay)
}

async function reconnectStream() {
  if (!wantLive || reconnecting) return
  reconnecting = true
  clearReconnectTimer()

  try {
    await destroyPlayer()
    stopWatchdog()
    resetMeta()
    status.value = 'loading'
    errorMsg.value = ''

    const [info] = await Promise.all([fetchStream(), loadPlayerSdk()])
    if (!wantLive) return
    await startPlayer(info, stream.value)
    // 等待期间用户可能已经手动关掉了
    if (!wantLive) {
      await destroyPlayer()
      return
    }
    startWatchdog()
  } catch {
    scheduleReconnect()
  } finally {
    reconnecting = false
  }
}

// ==================== 取流 ====================
function fetchStream(): Promise<StreamInfo> {
  return queryStream()
}

async function connect() {
  clearReconnectTimer()
  clearHiddenSuspendTimer()
  wantLive = true
  reconnectAttempt = 0
  suspendedByHidden = false

  await destroyPlayer()
  stopWatchdog()
  resetMeta()
  status.value = 'loading'
  errorMsg.value = ''

  try {
    // SDK 加载和取流并行，首次点击播放时少等一个网络往返
    const [info] = await Promise.all([fetchStream(), loadPlayerSdk()])
    await startPlayer(info, stream.value)
    startWatchdog()
  } catch (error) {
    status.value = 'error'
    errorMsg.value = (error as Error).message || '连接失败'
    // 断网时保留观看意图，等网络恢复后自动重连
    if (navigator.onLine) {
      wantLive = false
    } else {
      errorMsg.value = '网络好像断开了，恢复后会自动重连'
    }
  }
}

// 点击播放按钮才建立视频通道，避免进入页面自动拉流
async function openPlayback() {
  if (status.value !== 'idle' && status.value !== 'error') return
  await connect()
}

// 播放中关闭：销毁播放器回到未播放状态
async function closePlayback() {
  wantLive = false
  reconnectAttempt = 0
  suspendedByHidden = false
  clearReconnectTimer()
  clearHiddenSuspendTimer()
  await destroyPlayer()
  stopWatchdog()
  resetMeta()
  errorMsg.value = ''
  status.value = 'idle'
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined)
  if (pseudoFullscreen.value) exitPseudoFullscreen()
}

async function switchStream(target: 0 | 1) {
  if (target === stream.value || status.value !== 'playing') return
  stream.value = target
  wantLive = true
  reconnectAttempt = 0
  clearReconnectTimer()

  await destroyPlayer()
  resetMeta()
  status.value = 'switching'
  errorMsg.value = ''

  try {
    // 取流地址可能已过期，切换清晰度时重新取一次
    const [info] = await Promise.all([fetchStream(), loadPlayerSdk()])
    await startPlayer(info, target)
    startWatchdog()
  } catch (error) {
    status.value = 'error'
    errorMsg.value = (error as Error).message || '切换码流失败'
  }
}

function onQualityChange(key: string) {
  const target: 0 | 1 = Number(key) === 1 ? 1 : 0
  try {
    localStorage.setItem(QUALITY_KEY, String(target))
  } catch {
    /* 隐私模式下忽略 */
  }
  void switchStream(target)
}

// ==================== 设备信息 / 互动 ====================
async function loadDevice() {
  try {
    device.value = await queryDevice()
  } catch {
    /* 信息获取失败不影响播放 */
  }
}

function clearTeaseTimers() {
  if (teaseEndTimer) clearTimeout(teaseEndTimer)
  if (cooldownTimer) clearInterval(cooldownTimer)
  teaseEndTimer = null
  cooldownTimer = null
}

/** 逗猫棒在画面上挥 6 秒，和硬件侧的反应时间对齐 */
function startTeaseWindow() {
  if (teaseEndTimer) clearTimeout(teaseEndTimer)
  teasing.value = true
  teaseEndTimer = setTimeout(() => {
    teaseEndTimer = null
    teasing.value = false
    showToast(copy.value.teaseEndToast)
  }, TEASE_DURATION_MS)
}

/** 从点亮那一刻开始计冷却，灯灭之后还剩 24 秒的休息 */
function startCooldown() {
  if (cooldownTimer) clearInterval(cooldownTimer)
  const startedAt = Date.now()
  cooldownLeft.value = Math.ceil(COOLDOWN_MS / 1000)
  cooldownTimer = setInterval(() => {
    const remain = startedAt + COOLDOWN_MS - Date.now()
    cooldownLeft.value = Math.max(0, Math.ceil(remain / 1000))
    if (remain <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 250)
}

async function triggerInteract() {
  if (interactDisabled.value) return
  interacting.value = true
  try {
    await interact()
    startTeaseWindow()
    startCooldown()
  } catch (error) {
    showToast((error as Error).message || `${copy.value.interactLabel}指令下发失败`)
  } finally {
    interacting.value = false
  }
}

// ==================== 交互 ====================
function toggleMute() {
  if (!player) return
  if (muted.value) {
    if (volumePercent.value === 0) volumePercent.value = 50
    muted.value = false
    try {
      player.unMute()
      player.setVolume(volumePercent.value)
    } catch {
      /* ignore */
    }
  } else {
    muted.value = true
    try {
      player.mute()
    } catch {
      /* ignore */
    }
  }
}

function onVolumeChange(value: number | number[]) {
  const next = Array.isArray(value) ? value[0] : value
  volumePercent.value = next
  if (!player) return
  try {
    if (next === 0) {
      muted.value = true
      player.mute()
    } else {
      muted.value = false
      player.unMute()
      player.setVolume(next)
    }
  } catch {
    /* ignore */
  }
}

function onVolumeInput(event: Event) {
  onVolumeChange(Number((event.target as HTMLInputElement).value))
}

function takeScreenshot() {
  if (!player) return
  try {
    player.screenshot()
    showToast('已保存截图')
  } catch {
    showToast('截图失败')
  }
}

function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
}

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  document.body.style.overflow = locked ? 'hidden' : ''
}

function showRotateHint() {
  rotateHint.value = true
  if (rotateHintTimer) clearTimeout(rotateHintTimer)
  rotateHintTimer = setTimeout(() => (rotateHint.value = false), 2600)
}

function enterPseudoFullscreen() {
  pseudoFullscreen.value = true
  // 竖屏手机进入全屏时旋转成横屏
  rotated.value = isTouchDevice() && window.innerHeight > window.innerWidth
  if (rotated.value) showRotateHint()
  lockScroll(true)
  setTimeout(() => {
    resizePlayer()
    forceRedraw()
  }, 160)
}

function exitPseudoFullscreen() {
  pseudoFullscreen.value = false
  rotated.value = false
  rotateHint.value = false
  lockScroll(false)
  setTimeout(() => {
    resizePlayer()
    forceRedraw()
  }, 160)
}

async function toggleFullscreen() {
  const stage = stageRef.value
  if (!stage) return

  if (pseudoFullscreen.value) {
    exitPseudoFullscreen()
    return
  }
  if (document.fullscreenElement) {
    await document.exitFullscreen().catch(() => undefined)
    return
  }

  // 触屏设备统一走伪全屏：可稳定旋转为横屏，也不受 iOS 全屏 API 限制
  if (isTouchDevice()) {
    enterPseudoFullscreen()
    return
  }

  try {
    await stage.requestFullscreen()
    const orientation = screen.orientation as
      | (ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> })
      | undefined
    await orientation?.lock?.('landscape').catch(() => undefined)
  } catch {
    enterPseudoFullscreen()
  }
}

function isToolbarEvent(event: Event) {
  const target = event.target as Element | null
  return Boolean(target?.closest?.('.toolbar, button, a, input, .animal-tooltip'))
}

function onStageTap(event: MouseEvent) {
  // 手机端：点画面直接进横屏全屏，和原生播放器一致
  if (!isLive.value || !isTouchDevice() || isToolbarEvent(event)) return
  void toggleFullscreen()
}

function onStageDoubleClick(event: MouseEvent) {
  // 桌面端：双击画面切换全屏
  if (!isLive.value || isTouchDevice() || isToolbarEvent(event)) return
  void toggleFullscreen()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (eggOpen.value) {
    closeEgg()
    return
  }
  if (cornerOpen.value) {
    cornerOpen.value = false
    return
  }
  if (pseudoFullscreen.value) exitPseudoFullscreen()
}

// ==================== 彩蛋 ====================
function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function buildEggScene() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = vw <= 720
  const cols = mobile ? 3 : 4
  const rows = 3
  const cellW = vw / cols
  const cellH = vh / rows
  const stamp = Date.now()
  const photos: EggPhotoItem[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const width = Math.round(mobile ? rand(96, 142) : rand(136, 200))
      const cardH = (width - 12) * (1100 / 825) + 12
      const rot = Math.round(rand(-24, 24))
      const rad = (rot * Math.PI) / 180
      const bboxW = Math.abs(width * Math.cos(rad)) + Math.abs(cardH * Math.sin(rad))
      const bboxH = Math.abs(width * Math.sin(rad)) + Math.abs(cardH * Math.cos(rad))
      const cx = cellW * (col + 0.5) + rand(-cellW * 0.24, cellW * 0.24)
      const cy = cellH * (row + 0.5) + rand(-cellH * 0.18, cellH * 0.18)
      const x = Math.min(Math.max(cx, bboxW / 2 + 6), vw - bboxW / 2 - 6)
      const y = Math.min(Math.max(cy, bboxH / 2 + 6), vh - bboxH / 2 - 6)
      const index = row * cols + col

      photos.push({
        id: stamp + index,
        left: Math.round((x / vw) * 1000) / 10,
        top: Math.round((y / vh) * 1000) / 10,
        width,
        rot,
        spin: (2 + Math.floor(Math.random() * 2)) * 360,
        delay: Math.round(rand(0, 0.3) * 100) / 100,
        duration: Math.round(rand(1.3, 2) * 100) / 100,
      })
    }
  }
  eggPhotos.value = photos

  const count = mobile ? 52 : 86
  eggWords.value = Array.from({ length: count }, (_, index) => {
    const duration = Math.round(rand(2.8, 6) * 100) / 100
    return {
      id: stamp + 500 + index,
      left: Math.round(rand(0, 96)),
      size: Math.round(mobile ? rand(13, 28) : rand(15, 42)),
      rot: Math.round(rand(-32, 32)),
      // 负延迟让文字一打开就已经铺满整个屏幕，避免出现空档
      delay: -Math.round(rand(0, duration) * 100) / 100,
      duration,
      alpha: Math.round(rand(0.32, 0.72) * 100) / 100,
    }
  })
}

function openEgg() {
  buildEggScene()
  eggOpen.value = true
  lockScroll(true)
}

function closeEgg() {
  eggOpen.value = false
  eggPhotos.value = []
  eggWords.value = []
  if (!pseudoFullscreen.value) lockScroll(false)
}

// ==================== 树洞 ====================
function openTreeHole() {
  treeError.value = ''
  treeTyped.value = false
  treeOpen.value = true
  // 提前拿 IP，等用户写完时基本已经就绪
  void loadNetworkInfo()
}

async function onTreeImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  treeImageError.value = ''
  treeImageLoading.value = true
  try {
    treeImage.value = await prepareTreeImage(file)
  } catch (error) {
    treeImage.value = null
    treeImageError.value = error instanceof Error ? error.message : '图片处理失败，换一张试试'
  } finally {
    treeImageLoading.value = false
  }
}

function removeTreeImage() {
  treeImage.value = null
  treeImageError.value = ''
  if (treeFileRef.value) treeFileRef.value.value = ''
}

async function postToTreeHole(payload: string) {
  await fetch(TREE_WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: payload,
  })
}

async function submitTreeHole() {
  const content = treeMessage.value.trim()
  if (!content || treeSending.value || treeImageLoading.value) return
  treeSending.value = true
  treeError.value = ''
  const image = treeImage.value
  let textSent = false

  try {
    const network = await getNetworkInfoWithTimeout()
    const message = buildTreeHoleMessage(content, getClientInfo(), network, image)
    const payload = JSON.stringify({
      msgtype: 'markdown',
      markdown: { content: message },
    })

    if (image) {
      // 图片消息要单独发一次，体积大，不能用 sendBeacon
      await postToTreeHole(payload)
      textSent = true
      await postToTreeHole(
        JSON.stringify({
          msgtype: 'image',
          image: { base64: image.base64, md5: image.md5 },
        }),
      )
    } else {
      // 企业微信机器人不支持浏览器 CORS；用 text/plain 的简单请求直发，
      // sendBeacon 失败时再退回 no-cors fetch，避免预检被拦截。
      let queued = false
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        queued = navigator.sendBeacon(
          TREE_WEBHOOK,
          new Blob([payload], { type: 'text/plain;charset=UTF-8' }),
        )
      }
      if (!queued) await postToTreeHole(payload)
    }

    treeOpen.value = false
    treeMessage.value = ''
    removeTreeImage()
    showToast(image ? copy.value.treeSentBothToast : copy.value.treeSentToast)
  } catch {
    if (textSent) {
      treeOpen.value = false
      treeMessage.value = ''
      removeTreeImage()
      showToast('留言已经送达，但图片没发出去，可以再单独发一次')
    } else {
      treeError.value = '树洞暂时堵住了，稍后再试试吧'
    }
  } finally {
    treeSending.value = false
  }
}

function onViewportResize() {
  if (!pseudoFullscreen.value) return
  const shouldRotate = isTouchDevice() && window.innerHeight > window.innerWidth
  if (shouldRotate !== rotated.value) {
    rotated.value = shouldRotate
    if (!shouldRotate) rotateHint.value = false
  }
  setTimeout(() => {
    resizePlayer()
    forceRedraw()
  }, 120)
}

function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
  setTimeout(resizePlayer, 120)
}

function scheduleHiddenSuspend() {
  clearHiddenSuspendTimer()
  if (!wantLive || status.value !== 'playing') return
  hiddenSuspendTimer = setTimeout(() => {
    hiddenSuspendTimer = null
    if (!document.hidden || !wantLive || status.value !== 'playing') return
    // 页面挂后台超过 3 分钟：主动停流，省设备和流量，回前台再拉
    suspendedByHidden = true
    status.value = 'idle'
    clearReconnectTimer()
    stopWatchdog()
    void destroyPlayer()
  }, HIDDEN_SUSPEND_MS)
}

function onVisibilityChange() {
  if (document.hidden) {
    scheduleHiddenSuspend()
    return
  }

  clearHiddenSuspendTimer()
  if (suspendedByHidden) {
    suspendedByHidden = false
    reconnectAttempt = 0
    showToast('猫猫镜头重新连接中…')
    void reconnectStream()
    return
  }
  if (wantLive && status.value === 'error') {
    reconnectAttempt = 0
    void reconnectStream()
    return
  }
  if (player && status.value === 'playing') {
    forceRedraw()
    applyAudioState()
  }
}

function onOnline() {
  if (!wantLive || status.value === 'playing' || document.hidden) return
  reconnectAttempt = 0
  clearReconnectTimer()
  showToast('网络恢复了，正在重新连接…')
  void reconnectStream()
}

// ==================== 找猫 / 找熊 ====================
let huntHintIndex = 0

function onHuntHint() {
  const hints = copy.value.huntHints
  showToast(hints[huntHintIndex++ % hints.length])
}

function onCatFound() {
  showToast(copy.value.huntFoundToast)
}

function onHuntDone() {
  showToast(copy.value.huntDoneToast)
}

// ==================== 分享卡片 ====================
function releaseShareCard() {
  if (shareUrl.value) URL.revokeObjectURL(shareUrl.value)
  shareUrl.value = ''
  shareBlob = null
}

async function openShareFromMenu() {
  closeCorner()
  if (!isLive.value || !player) {
    showToast(copy.value.shareHint)
    return
  }

  releaseShareCard()
  shareOpen.value = true
  shareBusy.value = true

  try {
    const shot = await player.screenshot(undefined, 'jpeg', 0.92, 'base64')
    if (typeof shot !== 'string' || !shot.startsWith('data:image')) {
      throw new Error('截图失败')
    }
    const blob = await composeShareCard({ screenshot: shot, theme: theme.value })
    if (!shareOpen.value) return
    shareBlob = blob
    shareUrl.value = URL.createObjectURL(blob)
  } catch {
    shareOpen.value = false
    showToast(copy.value.shareFail)
  } finally {
    shareBusy.value = false
  }
}

function shareFileName() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const prefix = theme.value === 'bear' ? 'bear' : 'cat'
  return `${prefix}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.jpg`
}

function saveShareCard() {
  if (!shareUrl.value) return
  const link = document.createElement('a')
  link.href = shareUrl.value
  link.download = shareFileName()
  document.body.appendChild(link)
  link.click()
  link.remove()
  showToast(copy.value.shareSaved)
}

async function shareCardNative() {
  if (!shareBlob) return
  const file = new File([shareBlob], shareFileName(), { type: 'image/jpeg' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: copy.value.title,
        text: isBear.value ? '来看看小熊此刻的样子～' : '来看看猫猫此刻的样子～',
      })
      return
    }
  } catch (error) {
    if ((error as DOMException).name === 'AbortError') return
  }
  // 不支持文件分享时退回保存
  saveShareCard()
}

watch(shareOpen, (open) => {
  if (!open) releaseShareCard()
})

// ==================== 小角落菜单 ====================
function toggleCorner() {
  cornerOpen.value = !cornerOpen.value
}

function closeCorner() {
  cornerOpen.value = false
}

function openFortuneFromMenu() {
  closeCorner()
  fortuneRef.value?.openNote()
}

function openHuntFromMenu() {
  closeCorner()
  if (huntFound.value) onHuntDone()
  else onHuntHint()
}

function openTreeFromMenu() {
  closeCorner()
  openTreeHole()
}

function onDocumentClick(event: MouseEvent) {
  if (!cornerOpen.value) return
  const target = event.target as Element | null
  if (!target?.closest?.('.corner-slot')) cornerOpen.value = false
}

onMounted(() => {
  touchMode.value = isTouchDevice()
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onViewportResize)
  window.addEventListener('orientationchange', onViewportResize)
  window.visualViewport?.addEventListener('resize', onViewportResize)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('online', onOnline)
  runWhenIdle(() => void loadDevice())
})

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
  clearTeaseTimers()
  if (rotateHintTimer) clearTimeout(rotateHintTimer)
  clearReconnectTimer()
  clearHiddenSuspendTimer()
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', onViewportResize)
  window.removeEventListener('orientationchange', onViewportResize)
  window.visualViewport?.removeEventListener('resize', onViewportResize)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('online', onOnline)
  releaseShareCard()
  lockScroll(false)
  void destroyPlayer()
})
</script>

<style scoped src="./player.css"></style>
