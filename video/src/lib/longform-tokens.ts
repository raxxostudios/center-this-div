// Longform-specific dimensions. The shorts pipeline lives in tokens.ts at
// 1080x1920 (9:16). Long-form YouTube needs 1920x1080 (16:9).

export const LF_WIDTH = 1920;
export const LF_HEIGHT = 1080;
export const LF_FPS = 30;

// Pixel sizes scaled for 16:9 framing
export const LF_SIZES = {
  hero: 180,         // huge headline
  display: 120,      // big headline
  title: 84,         // section title
  subtitle: 48,      // sub-headline
  body: 36,          // body text / captions
  small: 28,         // metadata, chips
  micro: 22,         // labels
};
