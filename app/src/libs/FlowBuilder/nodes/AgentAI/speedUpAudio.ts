import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath.path);

export function speedUpAudioFile(
  inputPath: string,
  speed = 1.3,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(".ogg", "-fast.ogg");

    ffmpeg(inputPath)
      .audioFilters(`atempo=${speed}`)
      .format("ogg")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}
