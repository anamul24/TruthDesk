import mockData from "../data/mockData.json";

export async function getCategories() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { news_category: mockData.categories };
}

export async function getNewsByCategoryId(category_id) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (category_id === "08") {
    return mockData.news;
  }
  return mockData.news.filter((news) => news.category_id === category_id);
}

export async function getNewsDetailsById(news_id) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockData.news.find((news) => news._id === news_id) || null;
}
