import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { useRouter } from 'next/navigation';

export function CreateHover() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/create');
  };
  return (
    <div
      onClick={() => {
        handleClick();
      }}
      className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-sm p-4 relative h-[25rem]"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <EvervaultCard text="Create" />

      {/* <h2 className="dark:text-white text-black mt-4 text-sm font-light">
        Create a Chatbot for your website in minutes.
      </h2>
      <p className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
        Create
      </p> */}
    </div>
  );
}

export function Chatbot(id , name) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${id}`);
  };
  return (
    <div
      onClick={() => {
        handleClick();
      }}
      className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-sm p-4 relative h-[25rem]"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <EvervaultCard text="Chatbot" />

      <h2 className="dark:text-white text-black mt-4 text-sm font-light">
        {name}
      </h2>
      <p className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
        Chat
      </p>
    </div>
  );
}