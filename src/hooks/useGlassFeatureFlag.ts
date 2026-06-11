export function useGlassFeatureFlag(): boolean {
  return false;
}

export function useGlassToggle(): [boolean, () => void] {
  return [false, () => {}];
}

export async function loadGlassUI(): Promise<void> {}
export async function setGlassUI(_enabled: boolean): Promise<void> {}
