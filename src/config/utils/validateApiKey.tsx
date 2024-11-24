export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    const testUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

    try {
        const response = await fetch(testUrl);
        if (response.ok) {
            return true; // API Key 유효
        } else {
            console.error(`Invalid API Key: ${response.statusText}`);
            return false; // API Key 무효
        }
    } catch (error) {
        console.error(`Error validating API Key: ${error}`);
        return false;
    }
};
