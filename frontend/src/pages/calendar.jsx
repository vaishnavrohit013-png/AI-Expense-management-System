import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Loader2, 
  CreditCard, 
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';
import Layout from '../components/Layout';
import { calendarAPI } from '../services/api';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await calendarAPI.getDailyExpenses(month, year);
      setDailyExpenses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayData = dailyExpenses.find(d => d.date === dateStr);
      days.push({
        day: i,
        date: dateStr,
        ...dayData
      });
    }
    return days;
  }, [dailyExpenses, daysInMonth, firstDayOfMonth]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month - 1 + offset, 1));
  };

  const isToday = (dateStr) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  const monthTotal = dailyExpenses.reduce((acc, d) => acc + d.totalSpent, 0);
  const highestSpendDay = dailyExpenses.reduce((acc, d) => d.totalSpent > (acc.totalSpent || 0) ? d : acc, {});
  const noSpendDays = daysInMonth - dailyExpenses.length;

  return (
    <Layout>
      <div style={{ padding: '40px', maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <button 
              onClick={() => changeMonth(-1)}
              style={{
                padding: '10px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              <ChevronLeft size={24} color="#1e293b" />
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.02em', margin: 0, minWidth: '180px', textAlign: 'center' }}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h1>
            <button 
              onClick={() => changeMonth(1)}
              style={{
                padding: '10px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              <ChevronRight size={24} color="#1e293b" />
            </button>
            
            <button 
              onClick={() => setCurrentDate(new Date())}
              style={{
                position: 'absolute', right: '40px',
                padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '10px', fontWeight: '800', color: '#64748b', fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Today
            </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          
          {/* Main Calendar Grid */}
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            {/* Week Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '12px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{day}</div>
              ))}
            </div>

            {/* Grid Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#f1f5f9', border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
               {loading ? (
                  <div style={{ gridColumn: 'span 7', padding: '100px 0', textAlign: 'center', background: '#fff' }}>
                    <Loader2 className="animate-spin" size={24} color="#3b82f6" />
                  </div>
               ) : calendarDays.map((d, i) => {
                 if (!d.day) return <div key={i} style={{ background: '#fff', height: '90px' }} />;
                 
                 const today = isToday(d.date);
                 return (
                   <div 
                      key={i} 
                      onClick={() => setSelectedDay(d)}
                      style={{ 
                        background: '#fff', height: '90px', padding: '10px',
                        cursor: 'pointer', transition: 'all 0.15s',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                    >
                      <div style={{ 
                        fontSize: '12px', fontWeight: '800', 
                        color: today ? '#fff' : '#64748b',
                        background: today ? '#3b82f6' : 'none',
                        width: '22px', height: '22px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        borderRadius: '6px'
                      }}>
                        {d.day}
                      </div>

                      {d.totalSpent > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', margin: '0' }}>₹{d.totalSpent.toLocaleString()}</p>
                        </div>
                      )}

                      {/* Intensity Bar */}
                      {d.totalSpent > 0 && (
                        <div style={{ 
                          position: 'absolute', left: '10px', right: '10px', bottom: '10px',
                          height: '2px', background: '#f1f5f9', borderRadius: '1px', overflow: 'hidden'
                        }}>
                          <div style={{ 
                             width: `${Math.min((d.totalSpent / 2000) * 100, 100)}%`, height: '100%',
                             background: d.totalSpent > 5000 ? '#ef4444' : '#3b82f6'
                           }} />
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* Selected Day View */}
             <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {selectedDay?.day ? (
                   <>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>
                      {new Date(selectedDay.date).toLocaleDateString('default', { day: 'numeric', month: 'long' })}
                    </h3>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', marginBottom: '16px' }}>₹{selectedDay.totalSpent.toLocaleString()} spent</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {selectedDay.transactions.map((tx, idx) => (
                         <div key={idx} style={{ 
                            padding: '12px', background: '#f8fafc', borderRadius: '12px',
                            border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <div>
                               <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{tx.title || tx.description}</p>
                               <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{tx.category}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>₹{tx.amount.toLocaleString()}</span>
                         </div>
                       ))}
                    </div>
                   </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                     <p style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>Select a date</p>
                  </div>
                )}
             </div>

             {/* Monthly Highlights */}
             <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: '#1e293b' }}>Month Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Total Expense', value: `₹${monthTotal.toLocaleString()}`, color: '#3b82f6' },
                    { label: 'Heaviest Day', value: highestSpendDay.totalSpent ? `₹${highestSpendDay.totalSpent.toLocaleString()}` : '—', color: '#ef4444' },
                    { label: 'No-Spend Days', value: `${noSpendDays} Days`, color: '#10b981' }
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{stat.label}</span>
                       <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
             </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
