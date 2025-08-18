import InfluencerDashboard from '@/components/influencer/id/InfluencerDashboard';

interface InfluencerDashboardProps {
  params: { id: string };
}

const InfluencerDashboardPage = ({ params }: InfluencerDashboardProps) => {
  const { id } = params;
  return (
    <div 
      style={{
        transform: 'scale(0.85)', // Puedes ajustar este valor: 0.8 = 80%, 0.9 = 90%, etc.
        transformOrigin: 'top left',
        width: '117.65%', // Compensar el scale: 100% / 0.85 = 117.65%
        height: '117.65%'
      }}
    >
      <InfluencerDashboard id={id} />
    </div>
  );
};

export default InfluencerDashboardPage; 