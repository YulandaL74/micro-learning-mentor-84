const stats = [
  { value: "5", label: "Minutes Per Lesson", suffix: "min" },
  { value: "150", label: "Professional Skills", suffix: "+" },
  { value: "10K", label: "Active Learners", suffix: "+" },
  { value: "94", label: "Completion Rate", suffix: "%" },
];

export const Stats = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.value}
                <span className="text-3xl">{stat.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
