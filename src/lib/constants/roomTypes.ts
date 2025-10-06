export const ROOM_TYPES = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  TWIN: 'TWIN',
  TRIPLE: 'TRIPLE',
  QUAD: 'QUAD',
  SUITE: 'SUITE',
  DELUXE: 'DELUXE',
  FAMILY: 'FAMILY',
  STUDIO: 'STUDIO',
  APARTMENT: 'APARTMENT',
} as const

export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES]

export const ROOM_AMENITIES = {
  WIFI: 'WIFI',
  AIR_CONDITIONING: 'AIR_CONDITIONING',
  HEATING: 'HEATING',
  TV: 'TV',
  MINIBAR: 'MINIBAR',
  SAFE: 'SAFE',
  BALCONY: 'BALCONY',
  OCEAN_VIEW: 'OCEAN_VIEW',
  MOUNTAIN_VIEW: 'MOUNTAIN_VIEW',
  CITY_VIEW: 'CITY_VIEW',
  GARDEN_VIEW: 'GARDEN_VIEW',
  KITCHENETTE: 'KITCHENETTE',
  REFRIGERATOR: 'REFRIGERATOR',
  COFFEE_MAKER: 'COFFEE_MAKER',
  HAIR_DRYER: 'HAIR_DRYER',
  IRON: 'IRON',
  WORK_DESK: 'WORK_DESK',
  SOFA: 'SOFA',
  DINING_TABLE: 'DINING_TABLE',
  BATHTUB: 'BATHTUB',
  SHOWER: 'SHOWER',
  JACUZZI: 'JACUZZI',
} as const

export type RoomAmenity = typeof ROOM_AMENITIES[keyof typeof ROOM_AMENITIES]

export const ROOM_TYPE_DESCRIPTIONS: Record<RoomType, string> = {
  [ROOM_TYPES.SINGLE]: 'A room with one single bed, perfect for solo travelers',
  [ROOM_TYPES.DOUBLE]: 'A room with one double bed, ideal for couples',
  [ROOM_TYPES.TWIN]: 'A room with two single beds, great for friends traveling together',
  [ROOM_TYPES.TRIPLE]: 'A room with three single beds or one double and one single bed',
  [ROOM_TYPES.QUAD]: 'A room with four single beds or two double beds',
  [ROOM_TYPES.SUITE]: 'A larger room with separate living and sleeping areas',
  [ROOM_TYPES.DELUXE]: 'A premium room with enhanced amenities and services',
  [ROOM_TYPES.FAMILY]: 'A spacious room designed for families with children',
  [ROOM_TYPES.STUDIO]: 'A room with a kitchenette and living area combined',
  [ROOM_TYPES.APARTMENT]: 'A self-contained unit with full kitchen and living facilities',
}

export const ROOM_TYPE_CAPACITIES: Record<RoomType, number> = {
  [ROOM_TYPES.SINGLE]: 1,
  [ROOM_TYPES.DOUBLE]: 2,
  [ROOM_TYPES.TWIN]: 2,
  [ROOM_TYPES.TRIPLE]: 3,
  [ROOM_TYPES.QUAD]: 4,
  [ROOM_TYPES.SUITE]: 2,
  [ROOM_TYPES.DELUXE]: 2,
  [ROOM_TYPES.FAMILY]: 4,
  [ROOM_TYPES.STUDIO]: 2,
  [ROOM_TYPES.APARTMENT]: 4,
}

export function getRoomTypeCapacity(roomType: RoomType): number {
  return ROOM_TYPE_CAPACITIES[roomType] || 1
}

export function getRoomTypeDescription(roomType: RoomType): string {
  return ROOM_TYPE_DESCRIPTIONS[roomType] || 'Standard room'
}
