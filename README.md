# DPlayerMAX

DPlayerMAX 是一个为 Typecho 设计的视频播放器插件，基于 DPlayer 播放器核心，支持多种视频格式和弹幕功能。

## 安装说明

### 下载安装

1. 下载本插件
2. 解压后将文件夹重命名为 `DPlayerMAX`
3. 上传到 Typecho 插件目录 `usr/plugins/`
4. 在 Typecho 后台「控制台」->「插件」中启用插件

**重要：** 插件目录必须命名为 `DPlayerMAX`，否则资源文件将无法正确加载。

## 主要特性

- 🎬 支持多种视频格式（MP4、WebM、Ogg 等）
- 💬 支持弹幕功能
- 📝 支持字幕显示
- 🎨 可自定义主题颜色
- 📱 响应式设计，支持移动端
- 🔌 支持 HLS (m3u8) 格式
- 🎞️ 支持 FLV 格式
- 🚀 本地资源加载，无需依赖外部 CDN

## 配置选项

### 默认主题颜色
设置播放器的默认主题颜色，例如：`#FADFA3`、`#75c`、`red`、`blue` 等。
此设置可以被短代码中的 `theme` 参数覆盖。

### 弹幕服务器地址
用于保存和加载视频弹幕的服务器地址。
例如：`https://api.prprpr.me/dplayer/v3/`

### HLS 支持
开启后可以播放 m3u8 格式的视频流。

### FLV 支持
开启后可以播放 FLV 格式的视频。

## 使用方法

### 基本语法

在文章或页面中使用 `[dplayer]` 短代码插入视频播放器：

```
[dplayer url="视频地址" pic="封面图地址" /]
```

### 使用示例

#### 基础视频播放
```
[dplayer url="https://example.com/video.mp4" pic="https://example.com/cover.jpg" /]
```

#### 带弹幕的视频
```
[dplayer url="https://example.com/video.mp4" pic="https://example.com/cover.jpg" danmu="true" /]
```

#### 自动播放并循环
```
[dplayer url="https://example.com/video.mp4" autoplay="true" loop="true" /]
```

#### HLS 直播流
```
[dplayer url="https://example.com/live.m3u8" type="hls" /]
```

#### 带字幕的视频
```
[dplayer url="https://example.com/video.mp4" subtitle="true" subtitleurl="https://example.com/subtitle.vtt" /]
```

### 可用参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `url` | 视频文件地址（必填） | - |
| `pic` | 视频封面图片地址 | - |
| `type` | 视频类型（auto/hls/flv） | auto |
| `theme` | 播放器主题颜色 | 插件配置的默认颜色 |
| `autoplay` | 自动播放（true/false） | false |
| `loop` | 循环播放（true/false） | false |
| `screenshot` | 允许截图（true/false） | false |
| `danmu` | 开启弹幕（true/false） | false |
| `lang` | 语言（zh-cn/zh-tw/en） | zh-cn |
| `volume` | 默认音量（0-1） | 0.7 |
| `subtitle` | 开启字幕（true/false） | false |
| `subtitleurl` | 字幕文件地址 | - |
| `subtitletype` | 字幕类型（webvtt/srt） | webvtt |

## 从旧版 DPlayer 迁移

如果您之前使用的是 DPlayer 插件，请按以下步骤迁移：

### 迁移步骤

1. **备份配置**：记录当前插件的配置选项（主题颜色、弹幕服务器等）
2. **禁用旧插件**：在 Typecho 后台禁用 DPlayer 插件
3. **删除旧插件**：删除 `usr/plugins/DPlayer` 目录
4. **上传新插件**：将 DPlayerMAX 插件上传到 `usr/plugins/DPlayerMAX` 目录
5. **启用插件**：在后台重新启用插件（现在显示为 DPlayerMAX）
6. **重新配置**：根据备份的配置重新设置插件选项

### 重要说明

由于 Typecho 插件系统基于目录名存储配置，旧的 DPlayer 配置不会自动迁移到 DPlayerMAX。您需要手动重新配置插件选项。

**好消息**：文章中的 `[dplayer]` 短代码无需修改，会继续正常工作。

## 版权信息

- **作者**：[GamblerIX](https://github.com/GamblerIX)
- **仓库**：[DPlayerMAX](https://github.com/GamblerIX/DPlayerMAX)
- **许可证**：MIT LICENSE
- **鸣谢**：[DPlayer And Its Issue](https://github.com/MoePlayer/DPlayer-Typecho/issues/40)

## 技术支持

如遇到问题或有建议，欢迎在 GitHub 仓库提交 Issue。
