import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';

const UserStats = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [participatedActivities, setParticipatedActivities] = useState(0);
  const [createdActivities, setCreatedActivities] = useState(0);
  const [publications, setPublications] = useState(0);
  const [numActivitiesWeek, setNumActivitiesWeek] = useState(0);
  const [numActivitiesMonth, setNumActivitiesMonth] = useState(0);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myUserId = '1234'; // Obtén el ID del usuario actual de tu lógica
        const response = await axios.get(`/users/${myUserId}`);
        setCurrentUser(response.data);

        const participated = await activitiesParticipated(myUserId);
        setParticipatedActivities(participated);

        const created = await activitiesCreated(myUserId);
        setCreatedActivities(created);

        const numPublications = await publicationsMade(myUserId);
        setPublications(numPublications);

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const date = currentDate.toString();

        const numWeek = await activitiesWeek(myUserId, date);
        setNumActivitiesWeek(numWeek);

        const numMonth = await activitiesMonth(myUserId, date);
        setNumActivitiesMonth(numMonth);

        const data = await last6Weeks(myUserId);
        const labels = daysOfWeek();
        const chartData = {
          labels,
          datasets: [
            {
              data,
            },
          ],
        };
        setChartData(chartData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const activitiesParticipated = async (myUserId) => {
    const response = await axios.get(`/activities/participated/${myUserId}`);
    return response.data.length;
  };

  const activitiesCreated = async (myUserId) => {
    const response = await axios.get(`/activities/created/${myUserId}`);
    return response.data.length;
  };

  const publicationsMade = async (myUserId) => {
    const response = await axios.get(`/publications/user/${myUserId}`);
    return response.data.length;
  };

  const activitiesWeek = async (myUserId, date) => {
    const response = await axios.get(`/activities/week/${myUserId}/${date}`);
    return response.data.length;
  };

  const activitiesMonth = async (myUserId, date) => {
    const response = await axios.get(`/activities/month/${myUserId}/${date}`);
    return response.data.length;
  };

  const last6Weeks = async (myUserId) => {
    const response = await axios.get(`/activities/last6weeks/${myUserId}`);
    return response.data;
  };

  const daysOfWeek = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const dayOfWeek = currentDate.getDay();
    const adjustedDayOfWeek = (dayOfWeek + 6) % 7;
    currentDate.setDate(currentDate.getDate() - adjustedDayOfWeek);

    const days = [];
    for (let i = 0; i < 6; i++) {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - i * 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const startString = `${startOfWeek.getDate()} / ${startOfWeek.getMonth() + 1}`;
      const endString = `${endOfWeek.getDate()} / ${endOfWeek.getMonth() + 1}`;
      const weekRange = `${startString} - ${endString}`;
      days.push(weekRange);
    }
    return days;
  };

  return (
    <View>
      <Text>Stats</Text>
      <View style={styles.profile}>
        {currentUser ? (
          <View>
            <Text>{currentUser.appUser}</Text>
            <View style={styles.profileImage}>
              {currentUser.photoUser ? (
                <Image source={{ uri: currentUser.photoUser }} style={styles.profileImgCard} />
              ) : (
                <Text>Default Profile Image</Text>
              )}
            </View>
            <View style={styles.userStats}>
              <Text>Followed: {currentUser.followersUser?.length}</Text>
              <Text>Following: {currentUser.followedUser?.length}</Text>
              <Text>Created Activities: {createdActivities}</Text>
              <Text>Activities you participated: {participatedActivities}</Text>
              <Text>Publications made: {publications}</Text>
              <Text>Activities this week: {numActivitiesWeek}</Text>
              <Text>Activities last month: {numActivitiesMonth}</Text>
              {chartData && (
                <View style={styles.chartContainer}>
                  <Text>Activities Participated Last 6 Weeks</Text>
                  <BarChart
                    data={chartData}
                    width={200}
                    height={200}
                    yAxisLabel=""
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    // Styles for profile container
  },
  profileImage: {
    // Styles for profile image container
  },
  profileImgCard: {
    // Styles for profile image
  },
  userStats: {
    // Styles for user stats container
  },
  chartContainer: {
    // Styles for chart container
  },
});

export default UserStats;
