"use client";

import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      /* svg omitted for brevity - keep original svg */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.71945 1.83371H15.2802C18.3978 1.83371 20.1578 3.60196 20.167 6.71954V15.2812C20.167 18.3979 18.3978 20.167 15.2802 20.167H6.71945C3.60187 20.167 1.83362 18.3979 1.83362 15.2812V6.71954C1.83362 3.60196 3.60187 1.83371 6.71945 1.83371ZM11.0453 16.372C11.4403 16.372 11.7694 16.0787 11.8061 15.6845V6.34371C11.8428 6.05954 11.7062 5.77446 11.4587 5.61954C11.2011 5.46371 10.8894 5.46371 10.6428 5.61954C10.3944 5.77446 10.2578 6.05954 10.2844 6.34371V15.6845C10.3312 16.0787 10.6603 16.372 11.0453 16.372ZM15.2628 16.372C15.6478 16.372 15.9769 16.0787 16.0237 15.6845V12.6779C16.0503 12.3836 15.9137 12.1095 15.6653 11.9537C15.4187 11.7979 15.107 11.7979 14.8503 11.9537C14.6019 12.1095 14.4653 12.3836 14.502 12.6779V15.6845C14.5387 16.0787 14.8678 16.372 15.2628 16.372ZM7.5344 15.6845C7.49773 16.0787 7.16865 16.372 6.77356 16.372C6.3794 16.372 6.0494 16.0787 6.01365 15.6845V9.35038C5.98615 9.06529 6.12273 8.78204 6.37115 8.62621C6.61773 8.47038 6.93031 8.47038 7.17781 8.62621C7.4244 8.78204 7.56281 9.06529 7.5344 9.35038V15.6845Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/customers",
    label: "Customers",
    icon: (
      /* svg omitted */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.2917 5.04165C13.2917 3.26975 11.8553 1.83335 10.0834 1.83335L9.90736 1.83807C8.21731 1.92947 6.87505 3.32883 6.87505 5.04165C6.87505 6.8136 8.3115 8.25 10.0834 8.25L10.2594 8.24523C11.9495 8.15388 13.2917 6.75452 13.2917 5.04165ZM11.0001 15.5833C11.0001 16.5851 11.2679 17.5244 11.7358 18.3333H3.66675V15.0333C3.66675 12.3679 5.71498 10.1945 8.28086 10.0875L8.4792 10.0833H11.6876C12.5226 10.0833 13.308 10.3021 13.9925 10.6869C12.2158 11.5987 11.0001 13.449 11.0001 15.5833ZM13.806 19.2913L16.5001 17.6458L19.1941 19.2913L18.4616 16.2207L20.8591 14.167L17.7124 13.9147L16.5001 11L15.2877 13.9147L12.141 14.167L14.5385 16.2207L13.806 19.2913Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/orders",
    label: "Orders",
    icon: (
      /* svg omitted */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.12054 4.20383C4.58337 4.741 4.58337 5.6045 4.58337 7.33333V15.5833C4.58337 17.3122 4.58337 18.1757 5.12054 18.7128C5.65771 19.25 6.52121 19.25 8.25004 19.25H13.75C15.4789 19.25 16.3424 19.25 16.8795 18.7128C17.4167 18.1757 17.4167 17.3122 17.4167 15.5833V7.33333C17.4167 5.6045 17.4167 4.741 16.8795 4.20383C16.3424 3.66666 15.4789 3.66666 13.75 3.66666H8.25004C6.52121 3.66666 5.65771 3.66666 5.12054 4.20383ZM8.25004 7.33333C8.00693 7.33333 7.77377 7.42991 7.60186 7.60182C7.42995 7.77372 7.33337 8.00688 7.33337 8.25C7.33337 8.49311 7.42995 8.72627 7.60186 8.89818C7.77377 9.07009 8.00693 9.16666 8.25004 9.16666H13.75C13.9932 9.16666 14.2263 9.07009 14.3982 8.89818C14.5701 8.72627 14.6667 8.49311 14.6667 8.25C14.6667 8.00688 14.5701 7.77372 14.3982 7.60182C14.2263 7.42991 13.9932 7.33333 13.75 7.33333H8.25004ZM8.25004 11C8.00693 11 7.77377 11.0966 7.60186 11.2685C7.42995 11.4404 7.33337 11.6735 7.33337 11.9167C7.33337 12.1598 7.42995 12.3929 7.60186 12.5648C7.77377 12.7368 8.00693 12.8333 8.25004 12.8333H13.75C13.9932 12.8333 14.2263 12.7368 14.3982 12.5648C14.5701 12.3929 14.6667 12.1598 14.6667 11.9167C14.6667 11.6735 14.5701 11.4404 14.3982 11.2685C14.2263 11.0966 13.9932 11 13.75 11H8.25004ZM8.25004 14.6667C8.00693 14.6667 7.77377 14.7632 7.60186 14.9351C7.42995 15.1071 7.33337 15.3402 7.33337 15.5833C7.33337 15.8264 7.42995 16.0596 7.60186 16.2315C7.77377 16.4034 8.00693 16.5 8.25004 16.5H11.9167C12.1598 16.5 12.393 16.4034 12.5649 16.2315C12.7368 16.0596 12.8334 15.8264 12.8334 15.5833C12.8334 15.3402 12.7368 15.1071 12.5649 14.9351C12.393 14.7632 12.1598 14.6667 11.9167 14.6667H8.25004Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: (
      /* svg omitted */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M16.5 7.33333C16.5 7.81956 16.3069 8.28588 15.9631 8.6297C15.6193 8.97351 15.1529 9.16667 14.6667 9.16667C14.1805 9.16667 13.7142 8.97351 13.3703 8.6297C13.0265 8.28588 12.8334 7.81956 12.8334 7.33333C12.8334 6.8471 13.0265 6.38079 13.3703 6.03697C13.7142 5.69315 14.1805 5.5 14.6667 5.5C15.1529 5.5 15.6193 5.69315 15.9631 6.03697C16.3069 6.38079 16.5 6.8471 16.5 7.33333Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.9478 1.14583H11.0523C13.1689 1.14583 14.8271 1.14583 16.1215 1.32C17.4451 1.49783 18.4901 1.87 19.3105 2.6895C20.131 3.50991 20.5022 4.55491 20.68 5.8795C20.8542 7.17291 20.8542 8.83116 20.8542 10.9477V11.0284C20.8542 12.7783 20.8542 14.2102 20.7589 15.3762C20.6635 16.5495 20.4683 17.5276 20.0301 18.3416C19.8382 18.6997 19.5984 19.0227 19.3105 19.3105C18.4901 20.1309 17.4451 20.5022 16.1205 20.68C14.8271 20.8542 13.1689 20.8542 11.0523 20.8542H10.9478C8.83121 20.8542 7.17296 20.8542 5.87862 20.68C4.55496 20.5022 3.50996 20.13 2.68954 19.3105C1.96262 18.5836 1.58679 17.6788 1.38787 16.555C1.19079 15.4522 1.15504 14.08 1.14771 12.3768C1.14649 11.9429 1.14587 11.484 1.14587 11V10.9468C1.14587 8.83025 1.14587 7.172 1.32004 5.87766C1.49787 4.554 1.87004 3.509 2.68954 2.68858C3.50996 1.86816 4.55496 1.49691 5.87954 1.31908C7.17296 1.14491 8.83121 1.14491 10.9478 1.14491M6.06196 2.68125C4.89046 2.83891 4.18371 3.13958 3.66212 3.66116C3.13962 4.18366 2.83987 4.8895 2.68221 6.06191C2.52271 7.25358 2.52087 8.81925 2.52087 10.9991V11.7727L3.43846 10.9697C3.84094 10.6174 4.36229 10.4313 4.8969 10.449C5.43152 10.4667 5.93941 10.6869 6.31771 11.0651L10.2502 14.9976C10.5554 15.3027 10.9584 15.4904 11.3883 15.5276C11.8182 15.5648 12.2475 15.4492 12.6005 15.2011L12.8737 15.0086C13.3831 14.6507 13.9988 14.4762 14.6203 14.5136C15.2417 14.5511 15.832 14.7983 16.2947 15.2148L18.8889 17.5496C19.151 17.0014 19.306 16.2809 19.3885 15.2643C19.4783 14.1597 19.4792 12.7829 19.4792 10.9991C19.4792 8.81925 19.4774 7.25358 19.3179 6.06191C19.1602 4.8895 18.8595 4.18275 18.338 3.66025C17.8155 3.13866 17.1096 2.83891 15.9372 2.68125C14.7455 2.52175 13.1799 2.51991 11 2.51991C8.82021 2.51991 7.25362 2.52175 6.06196 2.68125Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/staff",
    label: "Staff",
    icon: (
      /* svg omitted */
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M20.1547 17.1692C20.1125 17.4495 20.0058 17.7162 19.843 17.9483C19.6811 18.1764 19.4666 18.3621 19.2177 18.4898C18.9688 18.6174 18.6928 18.6833 18.413 18.6817H16.8996C16.792 18.6813 16.6859 18.6554 16.5903 18.606C16.4947 18.5566 16.4122 18.4851 16.3496 18.3975C16.2864 18.31 16.2443 18.2089 16.2268 18.1023C16.2093 17.9957 16.2168 17.8865 16.2488 17.7833C16.588 16.7017 16.5146 15.4825 13.4429 13.53C13.3177 13.448 13.2218 13.3283 13.1691 13.1883C13.1164 13.0482 13.1095 12.895 13.1495 12.7508C13.1925 12.6088 13.2797 12.4842 13.3984 12.3951C13.5171 12.3061 13.6611 12.2573 13.8095 12.2558C15.1206 12.2737 16.4001 12.6607 17.5013 13.3724C18.6025 14.0842 19.4809 15.0919 20.0355 16.28C20.1483 16.5619 20.1892 16.8675 20.1547 17.1692ZM17.8621 7.05833C17.8597 8.13232 17.4319 9.16161 16.6724 9.92094C15.9129 10.6803 14.8835 11.1078 13.8095 11.11C13.6892 11.1078 13.5715 11.0745 13.4679 11.0133C13.3643 10.9521 13.2783 10.8651 13.2183 10.7608C13.1583 10.6565 13.1263 10.5384 13.1255 10.4181C13.1247 10.2978 13.1551 10.1793 13.2137 10.0742C13.7747 9.17669 14.0721 8.13962 14.0721 7.08125C14.0721 6.02288 13.7747 4.98581 13.2137 4.08833C13.1418 3.98559 13.0994 3.86513 13.091 3.74C13.0826 3.61488 13.1087 3.48984 13.1663 3.37844C13.2238 3.26704 13.3108 3.17351 13.4177 3.10798C13.5247 3.04245 13.6475 3.00742 13.7729 3.00667C14.3095 3.0053 14.8408 3.11354 15.3342 3.32476C15.8276 3.53598 16.2726 3.84572 16.642 4.235C17.3961 4.9964 17.821 6.02342 17.8255 7.095L17.8621 7.05833Z" fill="#E4E4E7"/>
  <path d="M15.2854 17.1417C15.3225 17.5904 15.2342 18.0406 15.0302 18.4421C14.8263 18.8435 14.5147 19.1803 14.1304 19.415C13.7473 19.6506 13.3054 19.7743 12.8563 19.7725H4.26436C3.8146 19.7745 3.37325 19.6507 2.99019 19.415C2.60501 19.1818 2.29317 18.8449 2.09024 18.443C1.88731 18.041 1.80147 17.5901 1.84252 17.1417C1.87578 16.6943 2.03465 16.2653 2.30086 15.9042C3.03172 14.9317 3.97306 14.1372 5.05441 13.58C6.13576 13.0228 7.32912 12.7174 8.54519 12.6867C9.76544 12.7109 10.9642 13.0123 12.0508 13.5682C13.1374 14.124 14.0833 14.9197 14.817 15.895C15.0838 16.2601 15.2464 16.6912 15.2854 17.1417ZM13.0579 6.71C13.0555 7.90168 12.5816 9.04398 11.7396 9.88731C10.8976 10.7307 9.75612 11.2065 8.56444 11.2108C7.90093 11.2092 7.24602 11.0607 6.64672 10.7759C6.04742 10.4912 5.5186 10.0773 5.09823 9.56392C4.67785 9.05057 4.37636 8.45051 4.21538 7.80683C4.05441 7.16314 4.03795 6.4918 4.16719 5.841C4.29697 5.19004 4.56942 4.57594 4.96493 4.04286C5.36044 3.50979 5.86918 3.07101 6.45456 2.75807C7.03993 2.44513 7.68739 2.26583 8.35035 2.23305C9.01331 2.20027 9.6753 2.31483 10.2887 2.5685C11.109 2.9072 11.8106 3.48132 12.305 4.21841C12.7993 4.95549 13.0642 5.8225 13.0662 6.71H13.0579Z" fill="#E4E4E7"/>
</svg>
    ),
  },
  {
    href: "/offer-management",
    label: "Offers",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M19.0199 11L20.0319 9.251C20.1536 9.04057 20.1866 8.79046 20.1239 8.55565C20.0612 8.32083 19.9077 8.12055 19.6973 7.99884L17.9465 6.98684V4.97017C17.9465 4.72705 17.8499 4.4939 17.678 4.32199C17.5061 4.15008 17.273 4.0535 17.0298 4.0535H15.0141L14.003 2.30359C13.8815 2.09306 13.6814 1.9394 13.4466 1.87642C13.3303 1.84525 13.209 1.83731 13.0896 1.85304C12.9702 1.86876 12.8551 1.90786 12.7508 1.96809L11 2.98009L9.24918 1.96717C9.03864 1.84562 8.78844 1.81268 8.55362 1.87559C8.31879 1.93851 8.11858 2.09214 7.99702 2.30267L6.98502 4.0535H4.96927C4.72615 4.0535 4.49299 4.15008 4.32108 4.32199C4.14918 4.4939 4.0526 4.72705 4.0526 4.97017V6.98592L2.30177 7.99792C2.19748 8.05819 2.10609 8.13842 2.03282 8.23403C1.95955 8.32963 1.90585 8.43874 1.87478 8.55512C1.8437 8.67149 1.83587 8.79285 1.85173 8.91226C1.86758 9.03166 1.90681 9.14677 1.96718 9.251L2.97918 11L1.96718 12.749C1.84617 12.9596 1.81334 13.2096 1.87584 13.4443C1.93835 13.679 2.09112 13.8795 2.30085 14.0021L4.05168 15.0141V17.0298C4.05168 17.273 4.14826 17.5061 4.32017 17.678C4.49208 17.8499 4.72523 17.9465 4.96835 17.9465H6.98502L7.99702 19.6973C8.07817 19.8361 8.19404 19.9513 8.33323 20.0316C8.47242 20.112 8.63013 20.1547 8.79085 20.1557C8.95035 20.1557 9.10893 20.1135 9.2501 20.0319L10.9991 19.0199L12.7499 20.0319C12.9604 20.1535 13.2105 20.1866 13.4453 20.1239C13.6801 20.0611 13.8804 19.9077 14.0021 19.6973L15.0132 17.9465H17.0289C17.272 17.9465 17.5052 17.8499 17.6771 17.678C17.849 17.5061 17.9456 17.273 17.9456 17.0298V15.0141L19.6964 14.0021C19.8007 13.9418 19.8921 13.8616 19.9654 13.766C20.0386 13.6704 20.0923 13.5613 20.1234 13.4449C20.1545 13.3285 20.1623 13.2072 20.1465 13.0877C20.1306 12.9683 20.0914 12.8532 20.031 12.749L19.0199 11ZM8.70743 6.4075C9.07223 6.40762 9.42203 6.55265 9.67989 6.81069C9.93776 7.06872 10.0826 7.41862 10.0824 7.78342C10.0823 8.14821 9.93728 8.49802 9.67925 8.75588C9.42121 9.01374 9.07131 9.15854 8.70652 9.15842C8.34172 9.1583 7.99192 9.01327 7.73405 8.75523C7.47619 8.4972 7.33139 8.1473 7.33152 7.7825C7.33164 7.41771 7.47667 7.0679 7.7347 6.81004C7.99274 6.55218 8.34264 6.40738 8.70743 6.4075ZM8.98243 15.2075L7.51577 14.1084L13.0158 6.77509L14.4824 7.87417L8.98243 15.2075ZM13.2908 15.5742C13.1101 15.5741 12.9313 15.5385 12.7644 15.4693C12.5976 15.4001 12.446 15.2987 12.3183 15.171C12.1906 15.0432 12.0894 14.8916 12.0203 14.7247C11.9512 14.5578 11.9157 14.3789 11.9158 14.1983C11.9158 14.0176 11.9515 13.8388 12.0206 13.6719C12.0898 13.5051 12.1912 13.3535 12.319 13.2258C12.4467 13.0981 12.5984 12.9968 12.7653 12.9278C12.9322 12.8587 13.1111 12.8232 13.2917 12.8233C13.6565 12.8234 14.0063 12.9684 14.2641 13.2264C14.522 13.4845 14.6668 13.8344 14.6667 14.1992C14.6666 14.564 14.5215 14.9138 14.2635 15.1716C14.0055 15.4295 13.6556 15.5743 13.2908 15.5742Z"
          fill="currentColor"
        />
      </svg>
    ),
  },

  {
    href: "/inventory",
    label: "Inventory",
    disabled: true,
    tag: "Upgrade",
    icon: (
      /* svg omitted */
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M5.148 19.25C4.73733 19.25 4.38778 19.1058 4.09933 18.8173C3.81089 18.5289 3.66667 18.1796 3.66667 17.7696V7.57442C3.40389 7.46564 3.18542 7.28933 3.01125 7.0455C2.83708 6.80106 2.75 6.52086 2.75 6.20492V4.23042C2.75 3.82097 2.89422 3.47172 3.18267 3.18267C3.47111 2.89422 3.82067 2.75 4.23133 2.75H17.7696C18.179 2.75 18.5283 2.89422 18.8173 3.18267C19.1058 3.47111 19.25 3.82067 19.25 4.23133V6.20492C19.25 6.52086 19.1629 6.80075 18.9888 7.04458C18.8152 7.28903 18.5967 7.46564 18.3333 7.57442V17.7696C18.3333 18.179 18.1891 18.5283 17.9007 18.8173C17.6122 19.1058 17.263 19.25 16.8529 19.25H5.148ZM4.23133 6.76958H17.7696C17.934 6.76958 18.069 6.71642 18.1748 6.61008C18.2805 6.50436 18.3333 6.36961 18.3333 6.20583V4.23042C18.3333 4.06603 18.2805 3.93097 18.1748 3.82525C18.069 3.71953 17.934 3.66667 17.7696 3.66667H4.23042C4.06603 3.66667 3.93097 3.71953 3.82525 3.82525C3.71953 3.93097 3.66667 4.06633 3.66667 4.23133V6.20492C3.66667 6.36992 3.71953 6.50497 3.82525 6.61008C3.93097 6.71581 4.06633 6.76867 4.23133 6.76867M8.60292 11.7938H13.3971V11H8.60292V11.7938Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

function Logo({
  size = 36,
  src = "/images/traditions.jpg",
  alt = "Traditions Designer Boutique",
}) {
  const w = size;
  const h = size;
  return (
    <div
      style={{ width: w, height: h }}
      className="flex items-center justify-center overflow-hidden"
    >
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        priority
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

export default function ResponsiveNav() {
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // mobile bottom: keep first 4 items visible
  const firstFive = links.slice(0, 4);
  const remaining = links.slice(4);

  const activeIndex = useMemo(() => {
    const idx = firstFive.findIndex(
      (l) => pathname === l.href || pathname?.startsWith(l.href + "/")
    );
    return idx >= 0 ? idx : 0;
  }, [pathname, firstFive]);

  const NavItem = ({ href, label, icon, disabled, tag }) => {
    const active = pathname === href || pathname?.startsWith(href + "/");

    const content = (
      <div
        className={`grid grid-cols-[26px_1fr] items-center h-10 rounded-xl px-3 md:text-[16px] text-[10px] font-medium tracking-[0.5px] transition
          ${active ? "text-white" : "text-white/90 hover:text-white"}`}
        aria-disabled={disabled ? true : undefined}
        title={disabled ? `${label} (Upgrade required)` : undefined}
      >
        <span className="w-[22px] h-[22px] flex items-center justify-center">
          {icon}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span>{label}</span>
          {tag && (
            <span className="ml-2 text-[10px] font-semibold bg-white/10 text-white px-2 py-0.5 rounded-full">
              {tag}
            </span>
          )}
        </span>
      </div>
    );

    if (disabled) {
      return (
        <div
          className="opacity-80 cursor-not-allowed"
          onClick={(e) => e.preventDefault()}
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        href={href}
        onClick={(e) => {
          // prevent default Link double-nav in some browsers
          e.preventDefault();
          // close drawer (if any)
          setDrawerOpen(false);
          // if your auth cookie might not be present on client navigation,
          // prefer full reload so server/middleware sees cookies:
          const hasToken =
            typeof document !== "undefined" &&
            document.cookie.includes("token=");
          if (!hasToken) {
            // full navigation forces server roundtrip where cookie will be applied
            window.location.href = href;
            return;
          }
          // otherwise do client-side transition
          router.push(href);
        }}
      >
        {" "}
        {content}
      </Link>
    );
  };

  return (
    <div className={`${poppins.className}`}>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 h-screen bg-[#121530] text-white flex-col p-6">
        <div className="flex-1 flex flex-col justify-start mt-6 gap-6">
          <div>
            {/* brand: logo + name */}
            <div className="flex items-center gap-3">
              <Logo size={50} src="/images/traditions.jpg" />
              <div>
                <div className="text-[16px] font-semibold leading-[20px]">
                  Traditions Designer Boutique
                </div>
                {/* <div className="text-xs text-white/70">Handcrafted • Premium</div> */}
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {links.map(({ href, label, icon, disabled, tag }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                icon={icon}
                disabled={disabled}
                tag={tag}
              />
            ))}
          </nav>
        </div>
        {/* Footer in desktop sidebar */}
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/80">
          <button
            onClick={async () => {
              await fetch("/api/v1/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5m5 5H3"
              />
            </svg>
            Logout
          </button>

          <div className="mt-3 mb-1">© {new Date().getFullYear()} BoutiqAI</div>
          <div>
            Powered by{" "}
            <a
              href="https://www.hanvitecsolutions.in/"
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              Hanvitec Solutions
            </a>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#121530] text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo size={38} src="/images/traditions.jpg" />
          <h1 className="text-[16px] font-semibold">
            Traditions Designer Boutique
          </h1>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          className="w-12 h-12 flex items-center justify-center"
        >
          <svg
            width="26"
            height="16"
            viewBox="0 0 26 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="26" height="2" rx="1" fill="white" />
            <rect y="7" width="26" height="2" rx="1" fill="white" />
            <rect y="14" width="26" height="2" rx="1" fill="white" />
          </svg>
        </button>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all ${
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-[#121530] text-white p-6 transform transition-transform ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Logo size={38} src="/images/traditions.jpg" />
              <div>
                <div className="text-base font-semibold">
                  Traditions Designer Boutique
                </div>
              </div>
            </div>

            <button
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded bg-white/10 flex items-center justify-center"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {(remaining.length > 0 ? remaining : links).map(
              ({ href, label, icon, disabled, tag }) => (
                <NavItem
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  disabled={disabled}
                  tag={tag}
                />
              )
            )}
          </nav>

          {/* Mobile drawer footer */}
          <div className="mt-auto pt-4 border-t border-white/10 text-xs text-white/80 flex flex-col gap-3">
            <button
              onClick={async () => {
                await fetch("/api/v1/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5m5 5H3"
                />
              </svg>
              Logout
            </button>

            <div>© {new Date().getFullYear()} Traditions Designer Boutique</div>
            <div>
              Powered by{" "}
              <a
                href="https://hanvitec.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Hanvitec Solutions
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-2 left-2 right-2 z-40">
        <div
          className="relative rounded-[4px] px-2 py-1 shadow-lg flex justify-between items-center overflow-visible"
          style={{
            background: "linear-gradient(90deg, #4C2699 0%, #936EDD 100%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -8,
              left: `${(activeIndex + 0.5) * (100 / firstFive.length)}%`,
              transform: "translateX(-50%)",
              width: 36,
              height: 6,
              borderRadius: 8,
              background: "#ffffff",
              transition: "left 220ms cubic-bezier(.2,.9,.2,1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
              zIndex: 0,
            }}
          />

          {firstFive.map(({ href, label, icon, disabled, tag }, idx) => {
            const active =
              pathname === href || pathname?.startsWith(href + "/");

            const itemContent = (
              <div
                className={`relative z-10 flex-1 px-2 py-2 rounded-md flex flex-col items-center justify-center gap-1 transition ${
                  active ? "text-white" : "text-white/90 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="w-[22px] h-[22px] flex items-center justify-center">
                  {icon}
                </span>
                <span className="text-[10px] leading-none">{label}</span>
                {tag && (
                  <span className="absolute -top-3 text-[10px] font-semibold bg-white/10 text-white px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                )}
              </div>
            );

            if (disabled) {
              return (
                <div
                  key={href}
                  className="relative z-10 flex-1 px-2 py-2 rounded-md flex flex-col items-center justify-center gap-1 opacity-80 cursor-not-allowed"
                >
                  {itemContent}
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  // close drawer if somehow open
                  setDrawerOpen(false);
                  const hasToken =
                    typeof document !== "undefined" &&
                    document.cookie.includes("token=");
                  if (!hasToken) {
                    window.location.href = href;
                    return;
                  }
                  router.push(href);
                }}
                className={`relative z-10 flex-1 px-2 py-2 rounded-md flex flex-col items-center justify-center gap-1 transition ${
                  active ? "text-white" : "text-white/90 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {itemContent}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* spacer so content isn't under top bar on mobile */}
      <div className="md:hidden h-14" />
    </div>
  );
}
