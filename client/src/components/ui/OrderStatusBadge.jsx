import Badge from './Badge';
import { ORDER_STATUSES } from '@/constants';

export default function OrderStatusBadge({ status }) {
  const found = ORDER_STATUSES.find(s => s.id === status);
  const colorMap = { blue: 'blue', yellow: 'yellow', orange: 'orange', purple: 'purple', green: 'green', red: 'red' };
  if (!found) return <Badge color="gray">{status}</Badge>;
  if (status === 'rejected') return <Badge color="red" dot>Rejected</Badge>;
  return <Badge color={colorMap[found.color] || 'gray'} dot>{found.label}</Badge>;
}
