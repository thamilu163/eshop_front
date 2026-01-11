export function recordMetric(name: string, value: number, tags?: Record<string, unknown>) {
  console.info('metric', { name, value, tags });
}
