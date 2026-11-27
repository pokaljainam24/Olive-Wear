import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Products from "../components/Products";
import Features from "../components/Features";
import Banner from "../components/Banner";
import ScrollScene from "../components/ScrollScene";
import useFetch from "../hooks/useFetch";
import { shopApi } from "../api/shop";

export default function Home() {
  const { data: products } = useFetch(() => shopApi.products());
  const { data: home } = useFetch(() => shopApi.content("home"));
  const section = (key) => home?.find((c) => c.key === key);

  return (
    <>
      {products?.length > 0 && <ScrollScene images={products.map((p) => p.img)} />}
      <Hero content={section("hero")} />
      <Categories />
      <Products />
      <Features content={section("features")} />
      <Banner content={section("banner")} />
    </>
  );
}
