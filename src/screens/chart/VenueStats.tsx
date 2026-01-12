import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Icon } from '@components';
import { COLORS } from '@constants';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;

// Default data structure to match the API response format
const defaultData = {
  hourlyVisitors: {
    labels: ['9AM', '12PM', '3PM', '6PM', '9PM', '12AM'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
  },
  dailyVisitors: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  },
  monthlyVisitors: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }]
  },
  genderDistribution: [
    { name: 'Male', population: 0, color: COLORS.secondary, legendFontColor: '#7F7F7F' },
    { name: 'Female', population: 0, color: COLORS.primary, legendFontColor: '#7F7F7F' },
  ],
  ageDistribution: {
    labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
    datasets: [{ data: [0, 0, 0, 0, 0] }]
  }
};

// Simple time frame selector component
const TimeFrameSelector = ({ selected, onSelect }) => {
  const options = ['Hour', 'Day', 'Month'];

  return (
    <View style={styles.timeFrameContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.timeFrameButton, selected === option && styles.timeFrameButtonSelected]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.timeFrameText, selected === option && styles.timeFrameTextSelected]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function VenueStats() {
  const [timeFrame, setTimeFrame] = useState('Hour');
  const [statistics, setStatistics] = useState(defaultData);
  const [forecast, setForecast] = useState(defaultData);
  const [insights, setInsights] = useState(defaultData);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const activityId = await AsyncStorage.getItem('activityId');
        const response = await axios.get(`${API_BACKEND_URL}/statistics/dashboard/${activityId}`);
        const data = response.data;
        const resp = await axios.get(`${API_BACKEND_URL}/statistics/forecast/${activityId}`);
              setForecast(resp.data);
        const respions = await axios.get(`${API_BACKEND_URL}/statistics/insights/${activityId}`);
        setInsights(respions.data.insights);
               
        console.log(insights); 
        // Make sure we have valid data with the expected structure
        if (data && typeof data === 'object') {
          // Check each expected property and use defaults for any missing ones
          const validData = {
            hourlyVisitors: data.hourlyVisitors || defaultData.hourlyVisitors,
            dailyVisitors: data.dailyVisitors || defaultData.dailyVisitors,
            monthlyVisitors: data.monthlyVisitors || defaultData.monthlyVisitors,
            genderDistribution: data.genderDistribution || defaultData.genderDistribution,
            ageDistribution: data.ageDistribution || defaultData.ageDistribution
          };
          setStatistics(validData);
        } else {
          console.error('Invalid data format received:', data);
          setStatistics(defaultData);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to default data if API call fails
        setStatistics(defaultData);
      } 
    };
  ;

    fetchStatistics();
  }, []); 

  // Get the appropriate data based on the selected timeframe
  const getChartData = () => {
    switch (timeFrame) {
      case 'Hour':
        return statistics.hourlyVisitors || defaultData.hourlyVisitors;
      case 'Day':
        return statistics.dailyVisitors || defaultData.dailyVisitors;
      case 'Month':
        return statistics.monthlyVisitors || defaultData.monthlyVisitors;
      default:
        return statistics.hourlyVisitors || defaultData.hourlyVisitors;
    }
  };

  // Simple chart config
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0, // optional, for cleaner numbers
  };


  // Safely get data with fallbacks
  const chartData = getChartData();
  const ageData = statistics.ageDistribution || defaultData.ageDistribution;
  
  // Calculate total visitors safely
  const totalVisitors = chartData.datasets[0]?.data?.reduce((sum, val) => sum + val, 0) || 0;
  
  // Get peak hour/day/month safely
  const dataPoints = chartData.datasets[0]?.data || [];
  const maxVisitorsIndex = dataPoints.length > 0 
    ? dataPoints.indexOf(Math.max(...dataPoints))
    : 0;
  const peakTime = chartData.labels?.[maxVisitorsIndex] || 'N/A';
  
  // Get primary age group safely
  const ageDataPoints = ageData.datasets[0]?.data || [];
  const maxAgeIndex = ageDataPoints.length > 0
    ? ageDataPoints.indexOf(Math.max(...ageDataPoints))
    : 0;
  const primaryAgeGroup = ageData.labels?.[maxAgeIndex] || 'N/A';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon type="materialCommunityIcons" name="chart-box" size={24} color="#333" />
        <Text style={styles.headerText}>{t('statistics.venueAnalytics.title')}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.statLabel}>AI Forecast</Text>
        <Text style={styles.statValue}>{forecast.recommendation}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>AI Insights</Text>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Text key={index} style={{ marginBottom: 8, color: '#333', fontSize: 14 }}>
              • {insight}
            </Text>
          ))
        ) : (
          <Text style={{ color: '#999' }}>No insights available</Text>
        )}
      </View>


      <TimeFrameSelector selected={timeFrame} onSelect={setTimeFrame} />

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('statistics.stats.totalVisitors')}</Text>
          <Text style={styles.statValue}>{totalVisitors}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('statistics.stats.peakTime', { timeFrame: t(timeFrame.toLowerCase()) })}</Text>
          <Text style={styles.statValue}>{peakTime}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('statistics.stats.primaryAge')}</Text>
          <Text style={styles.statValue}>{primaryAgeGroup}</Text>
        </View>
      </View>

        <>
          {/* Visitors Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t('statistics.charts.visitorsOverTime')}</Text>
            <LineChart
              data={chartData}
              width={windowWidth - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              withShadow={false}
              withDots={false}
              withInnerLines={true}
              withOuterLines={true}
            />
          </View>

          {/* Gender Distribution Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t('statistics.charts.genderDistribution')}</Text>
            <PieChart
              data={statistics.genderDistribution || defaultData.genderDistribution}
              width={windowWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
              hasLegend={true}
            />
          </View>

          {/* Age Distribution Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{t('statistics.charts.ageDistribution')}</Text>
            <BarChart
              data={ageData}
              width={windowWidth - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              withInnerLines={false}
              fromZero={true}
            />
          </View>
        </>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  timeFrameButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  timeFrameButtonSelected: {
    backgroundColor: COLORS.secondary,
  },
  timeFrameText: {
    color: '#333',
    fontWeight: '500',
  },
  timeFrameTextSelected: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    width: (windowWidth - 48) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  }
});