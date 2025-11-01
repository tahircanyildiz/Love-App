// Gün Sayacı Ekranı
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

export default function CounterScreen() {

  const MEETING_DATE = '2024-12-01';

  const [daysPassed, setDaysPassed] = useState(0);
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);

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

    // Toplam gün sayısı
    const totalDays = today.diff(meetingDate, 'day');
    setDaysPassed(totalDays);

    // Yıl, ay, gün hesaplama
    let tempDate = meetingDate;

    // Yılları hesapla
    const yearsDiff = today.diff(tempDate, 'year');
    setYears(yearsDiff);
    tempDate = tempDate.add(yearsDiff, 'year');

    // Ayları hesapla
    const monthsDiff = today.diff(tempDate, 'month');
    setMonths(monthsDiff);
    tempDate = tempDate.add(monthsDiff, 'month');

    // Günleri hesapla
    const daysDiff = today.diff(tempDate, 'day');
    setDays(daysDiff);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💞</Text>
      <Text style={styles.title}>Bugün birlikte</Text>
      <Text style={styles.days}>{daysPassed}.</Text>
      <Text style={styles.subtitle}>günümüz</Text>

      <View style={styles.detailContainer}>
        <Text style={styles.detailText}>
          {years} yıl {months} ay {days} gün
        </Text>
      </View>

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
    marginBottom: 20,
  },
  detailContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 20,
    color: '#FF1493',
    fontWeight: '600',
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
