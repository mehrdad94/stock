export async function retry(promiseFactory, retryCount) {
  try {
    return await promiseFactory();
  } catch (error) {
    if (retryCount <= 0) {
      throw error;
    }
    return await retry(promiseFactory, retryCount - 1);
  }
}