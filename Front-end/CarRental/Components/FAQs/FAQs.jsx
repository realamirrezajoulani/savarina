import React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

export default function CarRentalFAQ() {
  const [open, setOpen] = React.useState(1);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <div className="relative container mx-auto lg:w-[80%] w-[90%]">
      <div class="absolute inset-x-0 top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath : "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
      <h3 className="titleSlider lalezar mr-3 mb-12">سوالات متداول</h3>

      <Accordion open={open === 1}>
        <AccordionHeader onClick={() => handleOpen(1)} className="text-start text-sm leading-6 md:text-lg">
          سایت کرایه خودرو چیست؟
        </AccordionHeader>
        <AccordionBody className="iransans">
          این سایت یک پلتفرم آنلاین است که خدمات کرایه و اجاره خودروهای ایرانی را به مشتریان ارائه می‌دهد.
        </AccordionBody>
      </Accordion>

      <Accordion open={open === 2}>
        <AccordionHeader onClick={() => handleOpen(2)} className="text-start text-sm leading-6 md:text-lg">
          چگونه می‌توانم خودرو اجاره کنم؟
        </AccordionHeader>
        <AccordionBody className="iransans">
          شما می‌توانید با ثبت‌نام و ورود به سایت، خودرو مورد نظر خود را انتخاب کرده و پس از پرداخت هزینه اجاره، از خدمات بهره‌مند شوید.
        </AccordionBody>
      </Accordion>

      <Accordion open={open === 3}>
        <AccordionHeader onClick={() => handleOpen(3)} className="text-start text-sm leading-6 md:text-lg">
          آیا خودروهای ارائه شده دارای بیمه هستند؟
        </AccordionHeader>
        <AccordionBody className="iransans">
          بله، تمامی خودروهای کرایه‌ای دارای بیمه و سرویس‌های منظم هستند تا شما با اطمینان کامل از خدمات ما استفاده کنید.
        </AccordionBody>
      </Accordion>

      <Accordion open={open === 4}>
        <AccordionHeader onClick={() => handleOpen(4)} className="text-start text-sm leading-6 md:text-lg">
          آیا امکان تحویل و دریافت خودرو در محل‌های مختلف وجود دارد؟
        </AccordionHeader>
        <AccordionBody className="iransans">
          بله، خدمات ما شامل تحویل و دریافت خودرو در شهرهای مختلف و حتی در فرودگاه‌ها می‌باشد.
        </AccordionBody>
      </Accordion>

      <Accordion open={open === 5}>
        <AccordionHeader onClick={() => handleOpen(5)} className="text-start text-sm leading-6 md:text-lg">
          چگونه از تخفیف‌ها و پیشنهادهای ویژه بهره‌مند شوم؟
        </AccordionHeader>
        <AccordionBody className="iransans">
          با عضویت در خبرنامه و دنبال کردن شبکه‌های اجتماعی ما، از آخرین تخفیف‌ها و پیشنهادهای ویژه مطلع خواهید شد.
        </AccordionBody>
      </Accordion>
    </div>
  );
}
