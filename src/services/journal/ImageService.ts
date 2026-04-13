import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { logError } from '../../utils/logError';

const getPhotosDir = () => new Directory(Paths.document, 'journal_photos');

export async function ensurePhotosDir(): Promise<void> {
  const dir = getPhotosDir();
  if (!dir.exists) {
    dir.create();
  }
}

export async function pickAndSavePhoto(): Promise<string | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets[0]) return null;

    await ensurePhotosDir();
    const filename = `photo_${Date.now()}.jpg`;
    const dest = new File(getPhotosDir(), filename);
    const src = new File(result.assets[0].uri);
    src.copy(dest);
    return dest.uri;
  } catch (err: unknown) {
    logError('ImageService.pickAndSavePhoto', err);
    return null;
  }
}

export async function deletePhoto(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (err: unknown) {
    logError('ImageService.deletePhoto', err);
  }
}
