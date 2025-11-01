// Gün Sayacı Ekranı
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

export default function CounterScreen() {
  // Tanışma tarihi - Buraya kendi tarihinizi yazın
  const MEETING_DATE = '2023-06-15';

  const [daysPassed, setDaysPassed] = useState(0);

  useEffect(() => {
    calculateDays();
    // Her gün güncellemek için interval
    const interval = setInterval(() => {
      calculateDays();
    }, 60000 * 60 * 24); // Her 24 saat

    return () => clearInterval(interval);
  }, []);

  const calculateDays = () => {
    const meetingDate = dayjs(MEETING_DATE);
    const today = dayjs();
    const diff = today.diff(meetingDate, 'day');
    setDaysPassed(diff);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💞</Text>
      <Text style={styles.title}>Bugün birlikte</Text>
      <Text style={styles.days}>{daysPassed}</Text>
      <Text style={styles.subtitle}>günümüz</Text>
      <Text style={styles.date}>
        {dayjs(MEETING_DATE).format('DD.MM.YYYY')} tarihinden beri
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5EC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#FF69B4',
    fontWeight: '600',
    marginBottom: 10,
  },
  days: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FF1493',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 28,
    color: '#FF69B4',
    fontWeight: '600',
    marginBottom: 30,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});
