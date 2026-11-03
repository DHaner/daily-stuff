import { File, Paths } from 'expo-file-system';

/**
 * Task attachments live on the server. Sharing needs a local file, so opening one downloads it to
 * the cache first; the OS may purge it later, which is fine because it can always be fetched again.
 */
export async function downloadTaskFile(url: string, name: string): Promise<string> {
  const destination = new File(Paths.cache, name.replace(/[^\w.-]+/g, '_'));

  if (destination.exists) {
    destination.delete();
  }

  return (await File.downloadFileAsync(url, destination)).uri;
}
