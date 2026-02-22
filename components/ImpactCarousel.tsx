import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// From a bunch of sources from Google AI but accounting for the biogenic carbon
// cycle where natural emissions from cows are recycled, so the final number is
// basically the extra unnatural human emissions that come alongside a burger
const GRAMS_OF_CO2_PER_BURGER = (4.8 - 2.6) * 1000;

type TimeframeData = {
  label: string;
  carbon: number;
  water: number;
};

const CarouselCard = (data: TimeframeData, index: number) => {
  const burgers = data.carbon / GRAMS_OF_CO2_PER_BURGER;
  return (
    <CarouselItem key={index} className="h-full w-full">
      <div className="">
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="text-center">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              {data.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-center justify-around w-full mb-6">
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-green-600">
                  {data.carbon}g
                </span>
                <p className="text-xs text-muted-foreground">CO2 Emissions</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-blue-500">
                  {data.water}mL
                </span>
                <p className="text-xs text-muted-foreground">Water Used</p>
              </div>
            </div>
            {burgers > 0.1 ? (
              <p className="text-lg w-full">
                That's enough CO2 to make{" "}
                <span className="text-amber-400 text-3xl font-bold inline-block">
                  {burgers.toFixed(2)}
                </span>{" "}
                burgers!
              </p>
            ) : (
              <p className="text-lg w-full">
                Good job on keeping your usage low!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
  );
};

const ImpactCarousel = () => {
  const timeframes: TimeframeData[] = [
    // grams and milliliters, example data
    { label: "Today", carbon: 0.5, water: 1.2 },
    { label: "This Week", carbon: 3.2, water: 8.4 },
    { label: "This Month", carbon: 14000, water: 35 },
    { label: "This Year", carbon: 160, water: 400 },
  ];

  return (
    <div className="p-4 flex flex-col items-center">
      <Carousel className="w-full max-w-xs">
        <CarouselContent>{timeframes.map(CarouselCard)}</CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default ImpactCarousel;
