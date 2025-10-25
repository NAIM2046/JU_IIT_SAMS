const uploadImageToImgbb = async (imageFile) => {
  const API_KEY = "4bd8b57dda47335885bd162fb98dabc3"; // Replace with your IMGBB API key
  const formData = new FormData();
  formData.append("image", imageFile); // Append image file
  formData.append("name", imageFile.name); // Optional: Image name

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.success) {
      return result.data.url; // Return the direct image URL
    } else {
      throw new Error("Image upload failed!");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
export default uploadImageToImgbb;
