import { UpdateExtraPackageDTO_I } from "./DTO";

export interface PropsAlreadyExisting {
  id: number;
}

export interface PropsUpdate extends UpdateExtraPackageDTO_I {}

export interface UpdateExtraPackageRepository_I {
  alreadyExist(props: PropsAlreadyExisting): Promise<number>;
  update(props: PropsUpdate): Promise<void>;
}
