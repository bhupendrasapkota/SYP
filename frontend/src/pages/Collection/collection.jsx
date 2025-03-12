import Items from "./Items/Items";
import Banner from "./CollectionBanner/Banner";

const Collection = () => {
  return (
    <section className="pt-24">
      <Banner />
      <div className="pl-15 pb-20 pr-15">
        <Items />
      </div>
    </section>
  );
};

export default Collection;
