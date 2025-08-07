import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { PhStarFill } from "@/assets/icons/StarIcon";
import { router } from "expo-router";
import { PhDotsThreeVertical } from "@/assets/icons/DotsThreeVertical";
import { carData, flightsData, hotelData } from "@/constants/data";
import { PhClock } from "@/assets/icons/Clock";
import { PhCalendar } from "@/assets/icons/Calendar";
import { PhXCircle } from "@/assets/icons/XCircle";
import planePrimaryIllus from "@/assets/images/plane-primary-illus.png";

const ActiveItems = () => {
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  return (
    <View className="flex flex-col gap-y-2">
      {flightsData
        .slice(2, 3)
        .map(
          (
            {
              airlineLogo,
              airline,
              price,
              pricePer,
              departureCode,
              departureTime,
              departureCity,
              arrivalCode,
              arrivalTime,
              arrivalCity,
              date,
              duration,
              flightClass,
            },
            idx
          ) => (
            <Pressable
              key={`${idx}`}
              className="rounded-3xl bg-white p-5 dark:bg-n0 mt-2"
            >
              <View className="flex-row items-center justify-between pb-4">
                <View className="flex-row items-center justify-start gap-x-2">
                  <Image source={airlineLogo} />
                  <Text className="font-medium text-xl dark:text-white">
                    {airline}
                  </Text>
                </View>
                <View className="absolute right-2 top-2 z-50">
                  <View className="">
                    <Pressable
                      onPress={() => setShowMoreButton((prev) => !prev)}
                      className="flex w-7 h-7  items-center justify-center rounded-full   bg-b50   dark:text-white dark:bg-n50"
                    >
                      <PhDotsThreeVertical
                        color="#613bff"
                        size="18px"
                        type="bold"
                      />
                    </Pressable>
                    <View
                      className={` right-0 top-12 w-48 rounded-xl bg-white p-5 text-black shadow-lg z-50 dark:bg-n0 dark:text-white border border-n40 dark:border-n70 ${
                        showMoreButton ? "absolute" : "hidden"
                      }`}
                    >
                      <Pressable
                        onPress={() => {
                          setShowMoreButton(false);
                          setShowCancelModal(true);
                        }}
                        className=" flex-row  items-center justify-start gap-x-3 border-b border-dashed border-n100 pb-3 dark:border-n70"
                      >
                        <View className="flex items-center justify-center rounded-full bg-b50 p-2 text-p1 dark:bg-n50">
                          <PhXCircle color="#613bff" size="16px" />
                        </View>
                        <Text className="text-sm dark:text-white">Cancel</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => router.push("/SearchFlight")}
                        className="flex-row  items-center justify-start gap-x-3 pt-3"
                      >
                        <View className="flex items-center justify-center rounded-full bg-b50  p-2 text-p1 dark:bg-n50">
                          <PhCalendar color="#613bff" size="16px" />
                        </View>
                        <Text className="text-sm dark:text-white">
                          Reschedule
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between border-y border-dashed border-n100 py-4 dark:border-n70">
                <View className="">
                  <Text className="pt-2 text-sm text-n400 dark:text-n500">
                    {departureCode}
                  </Text>
                  <Text className="text-3xl font-bold text-n400 dark:text-n500">
                    {departureTime}
                  </Text>
                  <Text className="pt-2 text-sm text-n400 dark:text-n500">
                    {departureCity}
                  </Text>
                </View>
                <View className="">
                  <Image source={planePrimaryIllus} />
                  <Text className="-mt-1 flex text-center items-center justify-center text-xs text-n400 dark:text-n500">
                    {flightClass}
                  </Text>
                </View>
                <View className="flex flex-col  items-end">
                  <Text className="pt-2 text-sm text-n400 dark:text-n500 ">
                    {arrivalCode}
                  </Text>
                  <Text className="text-3xl font-bold text-n400 dark:text-n500">
                    {arrivalTime}
                  </Text>
                  <Text className="pt-2 text-sm text-n400 dark:text-n500">
                    {arrivalCity}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-start gap-x-4 pt-4">
                <View className="flex-row items-center justify-start gap-x-2">
                  <PhCalendar color="#613bff" size="16px" />

                  <Text className="text-sm text-n400 dark:text-n500">
                    {date}
                  </Text>
                </View>
                <View className="flex-row items-center justify-start gap-x-2">
                  <PhClock color="#613bff" size="16px" />

                  <Text className="text-sm text-n400 dark:text-n500">
                    {duration}
                  </Text>
                </View>
              </View>
              <Pressable
                className="pt-4"
                onPress={() => router.push("/BookingDetails")}
              >
                <Text className="rounded-lg bg-p1 py-2 text-center font-semibold text-white">
                  View Details
                </Text>
              </Pressable>
            </Pressable>
          )
        )}
      {hotelData
        .slice(1, 2)
        .map(({ id, name, image, price, location, phone }) => (
          <Pressable
            key={`${id}`}
            className="rounded-2xl bg-white dark:bg-n0 p-5"
            onPress={() => router.push("/HotelDetails")}
          >
            <View className="flex-row justify-center items-center  ">
              <Image source={image} className="rounded-2xl w-full" />
              <View className="absolute right-2 top-2 flex w-7 h-7 cursor-pointer items-center justify-center rounded-full bg-white  dark:bg-n0 dark:text-white">
                <PhDotsThreeVertical color="#613bff" size="18px" type="bold" />
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-2">
              <Text className="font-semibold text-base dark:text-white">
                {name}
              </Text>
              <Text className="flex-row justify-start items-center gap-x-1 ">
                <Text className="font-semibold text-p1 text-base">
                  ${price}
                </Text>
                <Text className="text-xs font-normal text-n400 dark:text-n500">
                  /night
                </Text>
              </Text>
            </View>
            <View className="flex-row items-end justify-between">
              <View className="gap-x-1 pt-1 text-sm text-n400 dark:text-n500">
                <Text className="text-n400 dark:text-n500">{location}</Text>
                <Text className="pt-0.5 text-n400 dark:text-n500">{phone}</Text>
              </View>
              <View className="flex-row items-center justify-start gap-x-2 text-p1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <PhStarFill key={`${idx}`} color="#613bff" size="12px" />
                ))}
              </View>
            </View>
            <Pressable
              className=" pt-4"
              onPress={() => router.push("/BookingDetails")}
            >
              <Text className="rounded-lg bg-p1 py-2 text-center font-semibold text-white">
                View Details
              </Text>
            </Pressable>
          </Pressable>
        ))}
      {carData
        .slice(0, 1)
        .map(
          ({ id, name, image, pricePerDay, distance, type, rating, label }) => (
            <Pressable
              key={`${id}`}
              className="rounded-2xl bg-white p-5 dark:bg-n0"
            >
              <View className="relative rounded-xl bg-b50 text-white dark:bg-n50">
                <View className="absolute left-2 top-2 flex-row items-center justify-start gap-2">
                  <View className="flex-row w-10 h-10 items-center justify-center rounded-full bg-b200">
                    <Text className="   text-sm text-white ">{label}</Text>
                  </View>
                  <Text className="text-sm text-n400 dark:text-n500">
                    {distance}
                  </Text>
                </View>
                <View className="absolute right-2 top-2 flex w-7 h-7 cursor-pointer items-center justify-center rounded-full bg-white  dark:bg-n0 dark:text-white">
                  <PhDotsThreeVertical
                    color="#613bff"
                    size="18px"
                    type="bold"
                  />
                </View>
                <Image source={image} className="rounded-2xl" />
              </View>
              <View className="flex-row items-center justify-between pt-4">
                <Text className="font-semibold text-base text-n400 dark:text-n500">
                  {name}
                </Text>
                <View className="flex-row justify-start items-center gap-x-1">
                  <Text className="font-semibold text-p1 text-base">
                    ${pricePerDay}
                  </Text>
                  <Text className="text-xs font-normal text-n400 dark:text-n500">
                    /day
                  </Text>
                </View>
              </View>
              <View className="flex-row items-end justify-between">
                <View className="gap-1 pt-1 text-sm text-n400 dark:text-n500">
                  <Text className="text-n400 dark:text-n500">{type}</Text>
                </View>
                <View className="flex-row items-center justify-start gap-x-2 text-p1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <PhStarFill key={`${idx}`} color="#613bff" size="12px" />
                  ))}
                </View>
              </View>
              <Pressable
                className=" pt-4"
                onPress={() => router.push("/BookingDetails")}
              >
                <Text className="rounded-lg bg-p1 py-2 text-center font-semibold text-white">
                  View Details
                </Text>
              </Pressable>
            </Pressable>
          )
        )}
    </View>
  );
};

export default ActiveItems;

const styles = StyleSheet.create({});
