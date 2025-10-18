import BikeList from "@/components/bikes/BikeList";

const Locations = async (props) => {
  const location = await props.params;
  console.log(location);
  return (
    <div className="border w-full p-20 min-h-screen">
      <BikeList />
    </div>
  );
};

export default Locations;
