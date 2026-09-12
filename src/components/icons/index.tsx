import type { SVGProps } from "react";

/* ==========================================================================
   Way More icon set
   --------------------------------------------------------------------------
   A single stroke system: 24x24 grid, 1.75 stroke, round caps and joins.
   Every icon inherits `currentColor` and sizes from the `size` prop so they
   sit correctly next to text at any scale.
   ========================================================================== */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
}

function Icon({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------ navigation */
export const IconHome = (p: IconProps) => (
  <Icon {...p}><path d="M3.5 10.2 12 3.8l8.5 6.4V19a1.5 1.5 0 0 1-1.5 1.5h-3.5V14h-7v6.5H5A1.5 1.5 0 0 1 3.5 19z" /></Icon>
);
export const IconCar = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 13.5h18M5.5 13.5 7 8.2A2 2 0 0 1 8.9 6.8h6.2A2 2 0 0 1 17 8.2l1.5 5.3" />
    <path d="M3 13.5V18a1 1 0 0 0 1 1h1.8a1 1 0 0 0 1-1v-1h10.4v1a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1v-4.5" />
    <path d="M6.8 16.2h.01M17.2 16.2h.01" />
  </Icon>
);
export const IconTag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.2 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.8a2 2 0 0 1-.6 1.4l-6.2 6.2a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1 0-2.8l6-6.2a2 2 0 0 1 1.3-.4z" />
    <path d="M16.3 7.7h.01" />
  </Icon>
);
export const IconChat = (p: IconProps) => (
  <Icon {...p}><path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2a9.8 9.8 0 0 1-2.7-.4L4.2 20.5l1.3-3.5A6.9 6.9 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2z" /></Icon>
);
export const IconDollarCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.2v9.6M14.4 9.4c-.4-.8-1.3-1.3-2.4-1.3-1.4 0-2.4.8-2.4 1.9s.9 1.6 2.4 1.9 2.5.8 2.5 2-1.1 2-2.5 2c-1.2 0-2.1-.5-2.5-1.4" />
  </Icon>
);
export const IconGear = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2.9" />
    <path d="M19.3 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.5 1.5 0 0 0-1.7-.3 1.5 1.5 0 0 0-.9 1.4v.2a1.8 1.8 0 0 1-3.6 0v-.1a1.5 1.5 0 0 0-1-1.4 1.5 1.5 0 0 0-1.7.3l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.5 1.5 0 0 0 .3-1.7 1.5 1.5 0 0 0-1.4-.9h-.2a1.8 1.8 0 0 1 0-3.6h.1a1.5 1.5 0 0 0 1.4-1 1.5 1.5 0 0 0-.3-1.7l-.1-.1A1.8 1.8 0 1 1 7.7 4.3l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.8 1.8 0 0 1 3.6 0v.1a1.5 1.5 0 0 0 .9 1.4 1.5 1.5 0 0 0 1.7-.3l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.2a1.8 1.8 0 0 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9z" />
  </Icon>
);
export const IconCalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.2" width="17" height="15.3" rx="2.2" />
    <path d="M3.5 10h17M8.2 3.5v3.4M15.8 3.5v3.4" />
  </Icon>
);
export const IconGavel = (p: IconProps) => (
  <Icon {...p}>
    <path d="m13.6 8.1-5.5 5.5M10.9 5.4l5.4 5.4M15.3 3.7l5 5M4.5 12.2l5 5M3.2 19.1l3.5-3.5M12.5 20.5h8.3" />
  </Icon>
);
export const IconClipboard = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4.5H7.2a1.7 1.7 0 0 0-1.7 1.7v12.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V6.2a1.7 1.7 0 0 0-1.7-1.7H15" />
    <rect x="9" y="2.8" width="6" height="3.5" rx="1.2" />
    <path d="M8.8 11.5h6.4M8.8 15h4.4" />
  </Icon>
);
export const IconBuilding = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20.5V5.8a1.3 1.3 0 0 1 1.3-1.3h7.4A1.3 1.3 0 0 1 14 5.8v14.7M14 9.5h4.7A1.3 1.3 0 0 1 20 10.8v9.7M2.8 20.5h18.4" />
    <path d="M7 8.3h4M7 12h4M7 15.6h4M16.7 13h.8M16.7 16.4h.8" />
  </Icon>
);
export const IconHeadset = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.2 14.5v-2.3a7.8 7.8 0 0 1 15.6 0v2.3" />
    <path d="M19.8 14.2v2.1a3.4 3.4 0 0 1-3.4 3.4H13" />
    <rect x="2.6" y="12.9" width="3.5" height="5.2" rx="1.6" />
    <rect x="17.9" y="12.9" width="3.5" height="5.2" rx="1.6" />
  </Icon>
);
export const IconChart = (p: IconProps) => (
  <Icon {...p}><path d="M4 20.2h16.2M7.2 16.8V10M12 16.8V5.5M16.8 16.8v-4.4" /></Icon>
);
export const IconUsers = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8.4" r="3.1" />
    <path d="M3.2 19.5a5.9 5.9 0 0 1 11.6 0" />
    <path d="M16.2 6.1a3.1 3.1 0 0 1 0 5.9M17.6 14.4a5.9 5.9 0 0 1 3.2 5.1" />
  </Icon>
);
export const IconDocument = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.4 3.2H7.6A1.9 1.9 0 0 0 5.7 5v14a1.9 1.9 0 0 0 1.9 1.9h8.8a1.9 1.9 0 0 0 1.9-1.9V7.8z" />
    <path d="M13.4 3.2v3.6a1.9 1.9 0 0 0 1.9 1.9h3M9 12.6h6M9 16h4" />
  </Icon>
);
export const IconTruck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.8 6.8a1.5 1.5 0 0 1 1.5-1.5h8.4a1.5 1.5 0 0 1 1.5 1.5v9.4H2.8z" />
    <path d="M14.2 9.4h3.3l3.7 3.6v3.2h-7z" />
    <circle cx="7" cy="18" r="1.9" /><circle cx="17.4" cy="18" r="1.9" />
  </Icon>
);
export const IconCreditCard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.8" y="5.6" width="18.4" height="12.8" rx="2.2" />
    <path d="M2.8 10h18.4M6.4 14.6h3.2" />
  </Icon>
);

/* ----------------------------------------------------------------- trust */
export const IconShieldCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 5.8v5.4c0 4.2 2.9 8.1 7 9.3 4.1-1.2 7-5.1 7-9.3V5.8z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </Icon>
);
export const IconClock = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.3V12l3.1 1.9" /></Icon>
);
export const IconTrophy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7.8 3.8h8.4v5.1a4.2 4.2 0 1 1-8.4 0z" />
    <path d="M7.8 5.4H5.2a2.2 2.2 0 0 0 2.6 4.2M16.2 5.4h2.6a2.2 2.2 0 0 1-2.6 4.2M12 13.1v3.4M8.6 20.2h6.8l-.7-3.7H9.3z" />
  </Icon>
);
export const IconHandshake = (p: IconProps) => (
  <Icon {...p}>
    <path d="m8.5 12.4 2.2 2.2a1.4 1.4 0 0 0 2 0l.4-.4 2.1 2.1a1.3 1.3 0 0 0 1.9-1.9l.7.7a1.3 1.3 0 0 0 1.9-1.9L14.5 8" />
    <path d="M14.5 8 12 10.4a1.6 1.6 0 0 1-2.3-2.2l2.6-2.6a2 2 0 0 1 1.5-.6h2.3l4 4M8.2 6.2 3.4 11l3.4 3.4" />
  </Icon>
);
export const IconSparkle = (p: IconProps) => (
  <Icon {...p}><path d="m12 3.4 1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9zM18.6 15.4l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" /></Icon>
);

/* ------------------------------------------------------------ ui control */
export const IconChevronRight = (p: IconProps) => (<Icon {...p}><path d="m9.2 5.5 6.5 6.5-6.5 6.5" /></Icon>);
export const IconChevronLeft = (p: IconProps) => (<Icon {...p}><path d="m14.8 5.5-6.5 6.5 6.5 6.5" /></Icon>);
export const IconChevronDown = (p: IconProps) => (<Icon {...p}><path d="m5.5 9 6.5 6.5L18.5 9" /></Icon>);
export const IconChevronUpDown = (p: IconProps) => (<Icon {...p}><path d="m8 10 4-4 4 4M8 14l4 4 4-4" /></Icon>);
export const IconArrowRight = (p: IconProps) => (<Icon {...p}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></Icon>);
export const IconArrowLeft = (p: IconProps) => (<Icon {...p}><path d="M19.5 12h-15M10.5 6l-6 6 6 6" /></Icon>);
export const IconPlus = (p: IconProps) => (<Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>);
export const IconMinus = (p: IconProps) => (<Icon {...p}><path d="M5 12h14" /></Icon>);
export const IconX = (p: IconProps) => (<Icon {...p}><path d="m6 6 12 12M18 6 6 18" /></Icon>);
export const IconCheck = (p: IconProps) => (<Icon {...p}><path d="m5 12.5 4.8 4.8L19 6.8" /></Icon>);
export const IconCheckCircle = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="m8.4 12.2 2.5 2.5 4.7-5" /></Icon>
);
export const IconXCircle = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="m9.4 9.4 5.2 5.2M14.6 9.4l-5.2 5.2" /></Icon>
);
export const IconAlert = (p: IconProps) => (
  <Icon {...p}><path d="M10.6 4.2 2.9 17.4A1.6 1.6 0 0 0 4.3 19.9h15.4a1.6 1.6 0 0 0 1.4-2.5L13.4 4.2a1.6 1.6 0 0 0-2.8 0z" /><path d="M12 9.4v3.8M12 16.4h.01" /></Icon>
);
export const IconInfo = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></Icon>
);
export const IconSearch = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="6.6" /><path d="m20 20-4.3-4.3" /></Icon>
);
export const IconFilter = (p: IconProps) => (
  <Icon {...p}><path d="M3.5 6.2h17M6.8 12h10.4M10 17.8h4" /></Icon>
);
export const IconBell = (p: IconProps) => (
  <Icon {...p}><path d="M18 9.2a6 6 0 0 0-12 0c0 6-2.2 7.4-2.2 7.4h16.4S18 15.2 18 9.2z" /><path d="M13.7 19.9a2 2 0 0 1-3.4 0" /></Icon>
);
export const IconHeart = (p: IconProps) => (
  <Icon {...p}><path d="M12 20.2 4.9 13.4a4.4 4.4 0 0 1 6.2-6.2L12 8.1l.9-.9a4.4 4.4 0 0 1 6.2 6.2z" /></Icon>
);
export const IconStar = (p: IconProps) => (
  <Icon {...p}><path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9z" /></Icon>
);
export const IconEye = (p: IconProps) => (
  <Icon {...p}><path d="M2.2 12S5.8 5.5 12 5.5 21.8 12 21.8 12 18.2 18.5 12 18.5 2.2 12 2.2 12z" /><circle cx="12" cy="12" r="2.9" /></Icon>
);
export const IconCamera = (p: IconProps) => (
  <Icon {...p}><path d="M3 8.8a1.8 1.8 0 0 1 1.8-1.8h2.3l1.3-2.1h6.8l1.3 2.1h2.7A1.8 1.8 0 0 1 21 8.8v9.1a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.9z" /><circle cx="12" cy="13" r="3.4" /></Icon>
);
export const IconUpload = (p: IconProps) => (
  <Icon {...p}><path d="M20.5 15.5v3.2a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8v-3.2M7.8 8.3 12 4l4.2 4.3M12 4v11.5" /></Icon>
);
export const IconPencil = (p: IconProps) => (
  <Icon {...p}><path d="M15.6 4.2a2.1 2.1 0 0 1 3 3L8.3 17.5l-4 1 1-4z" /></Icon>
);
export const IconTrash = (p: IconProps) => (
  <Icon {...p}><path d="M3.8 6.3h16.4M8.5 6.3V4.8a1.4 1.4 0 0 1 1.4-1.4h4.2a1.4 1.4 0 0 1 1.4 1.4v1.5M18.2 6.3v13.2a1.4 1.4 0 0 1-1.4 1.4H7.2a1.4 1.4 0 0 1-1.4-1.4V6.3M10.2 10.6v6M13.8 10.6v6" /></Icon>
);
export const IconPhone = (p: IconProps) => (
  <Icon {...p}><path d="M21 16.9v2.7a1.8 1.8 0 0 1-2 1.8 17.8 17.8 0 0 1-7.8-2.8 17.6 17.6 0 0 1-5.4-5.4A17.8 17.8 0 0 1 3 5.3a1.8 1.8 0 0 1 1.8-2h2.7a1.8 1.8 0 0 1 1.8 1.6 11.6 11.6 0 0 0 .6 2.6A1.8 1.8 0 0 1 9.5 9.4L8.3 10.6a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4 11.6 11.6 0 0 0 2.6.6 1.8 1.8 0 0 1 1.7 1.8z" /></Icon>
);
export const IconMail = (p: IconProps) => (
  <Icon {...p}><rect x="2.8" y="5" width="18.4" height="14" rx="2.2" /><path d="m3.4 6.6 8.6 6 8.6-6" /></Icon>
);
export const IconMapPin = (p: IconProps) => (
  <Icon {...p}><path d="M19 10.3c0 5.3-7 10.4-7 10.4s-7-5.1-7-10.4a7 7 0 1 1 14 0z" /><circle cx="12" cy="10.2" r="2.6" /></Icon>
);
export const IconLock = (p: IconProps) => (
  <Icon {...p}><rect x="4.6" y="10.4" width="14.8" height="10.1" rx="2" /><path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8" /></Icon>
);
export const IconMenu = (p: IconProps) => (<Icon {...p}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></Icon>);
export const IconLogout = (p: IconProps) => (
  <Icon {...p}><path d="M9.5 20.5H5.6a1.9 1.9 0 0 1-1.9-1.9V5.4a1.9 1.9 0 0 1 1.9-1.9h3.9M15.4 16.2l4.4-4.2-4.4-4.2M19.4 12H9.2" /></Icon>
);
export const IconExternal = (p: IconProps) => (
  <Icon {...p}><path d="M13.6 4.2h6.2v6.2M19.4 4.6 11 13M17 13.6v5.1a1.8 1.8 0 0 1-1.8 1.8H5.5a1.8 1.8 0 0 1-1.8-1.8V9a1.8 1.8 0 0 1 1.8-1.8h5.2" /></Icon>
);
export const IconVin = (p: IconProps) => (
  <Icon {...p}><rect x="2.8" y="6.5" width="18.4" height="11" rx="1.8" /><path d="M6.2 9.6v4.8M8.6 9.6v4.8M11.4 9.6v4.8M14.4 9.6v4.8M17.8 9.6v4.8" /></Icon>
);
