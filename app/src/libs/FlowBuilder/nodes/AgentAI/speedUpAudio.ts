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
    const extension = inputPath.match(/\.(.+$)/);
    if (!extension) {
      return reject();
    }

    if (extension[1] === "mp4") {
      const outputPath = inputPath.replace(extension[0], `-fast.mp3`);

      ffmpeg(inputPath)
        .audioFilters(`atempo=${speed}`)
        .noVideo()
        .audioCodec("libmp3lame")
        .format(extension[1])
        .toFormat("mp3")
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .save(outputPath);
    } else {
      const outputPath = inputPath.replace(
        extension[0],
        `-fast${extension[0]}`,
      );

      ffmpeg(inputPath)
        .audioFilters(`atempo=${speed}`)
        .format(extension[1])
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .save(outputPath);
    }
  });
}

export async function getAudioDuration(
  filePath: string,
): Promise<number | undefined> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      // O campo duration vem em segundos (ex: 120.5)
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
}
