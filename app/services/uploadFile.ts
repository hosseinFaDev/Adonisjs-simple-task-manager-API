export async function uploadFile(file: any, filePath: string): Promise<string | undefined> {
    let fileName: string | undefined
    if (file) {
        await file.moveToDisk(filePath)
        fileName = file.fileName;
        return fileName
    }

}