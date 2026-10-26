/** Vklop šele, ko naročnik potrdi resnične izdelke, fotografije in kategorije. */
export const enableMotoEquipment = false;

export type MotoEquipmentItem = {
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  interest: string;
};

export const motoEquipment: MotoEquipmentItem[] = [];
