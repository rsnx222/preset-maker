import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { type ItemData } from '../../../types/item-data';
import { type ApplicationState } from '../store';
import { type SavedPresetData } from '../../../types/saved-preset-data';
import { SlotType } from '../../../types/slot-type';
import { type Breakdown, BreakdownType } from '../../../types/breakdown';
import { type FamiliarData, type Familiars } from '../../../types/familiar';
import { type RelicData, type Relics } from '../../../types/relic';

// Define a type for the slice state
interface PresetState {
  presetName: string
  presetNotes: string
  inventorySlots: ItemData[]
  equipmentSlots: ItemData[]
  familiars: Familiars
  relics: Relics
  breakdown: Breakdown[]
  slotType: SlotType
  slotIndex: number
}

interface IndexedSlot<T> {
  index: number
  value: T
}

type SetSlot = IndexedSlot<ItemData>;
interface SwapSlots {
  sourceIndex: number
  targetIndex: number
}
type FamiliarSlot = IndexedSlot<FamiliarData>;
type RelicSlot = IndexedSlot<RelicData | null>;

function blankRelic(): RelicData {
  return { label: "", name: "", image: "", breakdownNotes: "", energy: 0, description: "" };
}
function blankFamiliar(): FamiliarData {
  return { label: "", name: "", image: "", breakdownNotes: "" };
}

const fillArrayWithSlotData = (numItems: number): any[] =>
  new Array(numItems).fill({
    name: '',
    image: '',
    label: '',
    breakdownNotes: ''
  });

// Define the initial state using that type
const initialState: PresetState = {
  presetName: '',
  presetNotes: '',
  inventorySlots: Array.from({ length: 28 }, () => ({
    name: '',
    image: '',
    label: '',
    selected: false,
    breakdownNotes: ''
  })),
  equipmentSlots: fillArrayWithSlotData(13),
  familiars: {
    primaryFamiliars: fillArrayWithSlotData(1),
    alternativeFamiliars: fillArrayWithSlotData(3)
  },
  relics: {
    primaryRelics: fillArrayWithSlotData(3),
    alternativeRelics: fillArrayWithSlotData(3)
  },
  breakdown: [],
  slotType: SlotType.Inventory,
  slotIndex: -1
};

export const presetSlice = createSlice({
  name: 'preset',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    resetToInitialState: (state: PresetState) => {
      state.presetName = initialState.presetName;
      state.presetNotes = initialState.presetNotes;
      state.inventorySlots = initialState.inventorySlots;
      state.equipmentSlots = initialState.equipmentSlots;
      state.relics = initialState.relics;
      state.familiars = initialState.familiars;
      state.breakdown = initialState.breakdown;
    },
    setPresetName: (state: PresetState, action: PayloadAction<string>) => {
      state.presetName = action.payload;
    },
    setInventorySlot: (state: PresetState, action: PayloadAction<SetSlot>) => {
      state.inventorySlots[action.payload.index] = action.payload.value;
    },
    swapInventorySlots: (state: PresetState, action: PayloadAction<SwapSlots>) => {
      const { sourceIndex, targetIndex } = action.payload;
      if (sourceIndex === undefined || targetIndex === undefined) {
        return;
      }

      const sourceSlot = state.inventorySlots[sourceIndex];
      const targetSlot = state.inventorySlots[targetIndex];

      state.inventorySlots[targetIndex] = sourceSlot;
      state.inventorySlots[sourceIndex] = targetSlot;
    },
    setEquipmentSlot: (state: PresetState, action: PayloadAction<SetSlot>) => {
      state.equipmentSlots[action.payload.index] = action.payload.value;
    },
    setPrimaryRelic: (state: PresetState, action: PayloadAction<RelicSlot>) => {
      const { index, value } = action.payload
      state.relics.primaryRelics[index] = value ?? blankRelic()
    },
    setAlternativeRelic: (state: PresetState, action: PayloadAction<RelicSlot>) => {
      const { index, value } = action.payload
      // keep the same length; blank out the slot rather than remove
      state.relics.alternativeRelics[index] = value ?? blankRelic()
    },
    setPrimaryFamiliar: (state: PresetState, action: PayloadAction<FamiliarSlot>) => {
      const { index, value } = action.payload
      state.familiars.primaryFamiliars[index] = value ?? blankFamiliar()
    },
    setAlternativeFamiliar: (state: PresetState, action: PayloadAction<FamiliarSlot>) => {
      const { index, value } = action.payload
      state.familiars.alternativeFamiliars[index] = value ?? blankFamiliar()
    },
    setPresetNotes: (state: PresetState, action: PayloadAction<string>) => {
      state.presetNotes = action.payload;
    },
    setEntireBreakdown: (
      state: PresetState,
      action: PayloadAction<Breakdown[]>
    ) => {
      state.breakdown = action.payload;
    },
    setBreakdown: (state: PresetState, action: PayloadAction<Breakdown>) => {
      const { breakdownType, itemName, description } = action.payload;

      const targetSlots =
        breakdownType === BreakdownType.Equipment
          ? state.equipmentSlots
          : state.inventorySlots;

      targetSlots
        .filter((item) => item.label === itemName)
        .forEach((item: ItemData) => (item.breakdownNotes = description));
    },
    importDataAction: (
      state: PresetState,
      action: PayloadAction<SavedPresetData>
    ) => {
      state.presetName = action.payload.presetName;
      state.presetNotes = action.payload.presetNotes ?? '';
      state.inventorySlots = action.payload.inventorySlots;
      state.equipmentSlots = action.payload.equipmentSlots;
      // New state properties must be defaulted to `initialState` as it
      // will not exist in older saved presets.
      state.relics = action.payload.relics ?? initialState.relics;
      state.familiars = action.payload.familiars ?? initialState.familiars;
    },
    updateSlotType: (state: PresetState, action: PayloadAction<SlotType>) => {
      state.slotType = action.payload;
    },
    updateSlotIndex: (state: PresetState, action: PayloadAction<number>) => {
      state.slotIndex = action.payload;
    },
    toggleSlotSelection: (
      state: PresetState,
      action: PayloadAction<number>
    ) => {
      const currentSelected = state.inventorySlots[action.payload].selected ?? false;
      state.inventorySlots[action.payload].selected = !currentSelected;
    },
    clearSlotSelection: (state: PresetState) => {
      state.inventorySlots = state.inventorySlots.map((slot) => ({
        ...slot,
        selected: false
      }));
    }
  }
});

export const {
  resetToInitialState,
  setPresetName,
  setPresetNotes,
  setInventorySlot,
  swapInventorySlots,
  setEquipmentSlot,
  setPrimaryRelic,
  setAlternativeRelic,
  setPrimaryFamiliar,
  setAlternativeFamiliar,
  setEntireBreakdown,
  setBreakdown,
  importDataAction,
  updateSlotType,
  updateSlotIndex,
  toggleSlotSelection,
  clearSlotSelection
} = presetSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectPreset = (state: ApplicationState): PresetState => state.preset;
export const selectPresetName = (state: ApplicationState): string =>
  state.preset.presetName;
export const selectInventorySlots = (state: ApplicationState): ItemData[] =>
  state.preset.inventorySlots;
export const selectBreakdown = (state: ApplicationState): Breakdown[] =>
  state.preset.breakdown;

export default presetSlice.reducer;
