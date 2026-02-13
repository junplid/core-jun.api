import { GetServicesTodayDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import moment from "moment-timezone";

const tz = "America/Sao_Paulo";

export class GetServicesTodayUseCase {
  constructor() {}

  async run({ ...dto }: GetServicesTodayDTO_I) {
    try {
      const startOfDayMoment = moment().tz(tz).startOf("day");
      const startOfNextDayMoment = startOfDayMoment.clone().add(1, "day");

      const startOfDay = startOfDayMoment.clone();
      const startOfNextDay = startOfNextDayMoment.toDate();

      const rawData = await prisma.$queryRaw<
        { bucket: string; count: number }[]
      >`
SELECT 
  to_char(gs.bucket AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') AS bucket,
  COUNT(fs.id)::int AS count

FROM generate_series(
  ${startOfDay.toDate()}::timestamptz,
  ${startOfNextDay}::timestamptz - interval '5 minutes',
  interval '5 minutes'
) AS gs(bucket)

LEFT JOIN "FlowState" fs
  ON tstzrange(
       fs."createAt",
       COALESCE(fs."finishedAt", 'infinity')
     ) &&
     tstzrange(
       gs.bucket,
       gs.bucket + interval '5 minutes'
     )

LEFT JOIN "Chatbot" cb
  ON cb.id = fs."chatbotId"

LEFT JOIN "Campaign" cp
  ON cp.id = fs."campaignId"

WHERE
  fs.id IS NULL
  OR
  cb."accountId" = ${dto.accountId}
  OR
  cp."accountId" = ${dto.accountId}

GROUP BY gs.bucket
ORDER BY gs.bucket;
`;

      const result: Record<string, number | null> = {};

      let cursor = startOfDayMoment.clone();
      const now = moment().tz(tz);

      while (cursor.isBefore(startOfNextDay)) {
        const key = cursor.format("HH:mm");

        if (cursor.isSameOrBefore(now)) {
          result[key] = 0;
        } else {
          result[key] = null;
        }

        cursor.add(5, "minutes");
      }

      for (const row of rawData) {
        if (result[row.bucket] !== null) {
          result[row.bucket] = row.count;
        }
      }

      return {
        message: "OK!",
        status: 200,
        services: result,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi achar os atendimentos de hoje.",
        type: "error",
      });
    }
  }
}
