import BikeList from "@/components/bikes/BikeList";

const Locations = async (props) => {
  const location = await props.params;
  console.log(location);
  return (
    <div className="w-full pt-[90px] px-4 sm:px-8 lg:px-16 pb-12 min-h-screen">
      <BikeList />
    </div>
  );
};

export default Locations;
