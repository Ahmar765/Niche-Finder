
import { cookies } from 'next/headers';
import Script from 'next/script';
import { CookieBanner } from './cookie-banner';

export async function CookieConsent() {
    const cookieStore = await cookies();
    const consentCookie = cookieStore.get('localConsent');
    
    let consent = {
        necessary: true,
        analytics: false,
        marketing: false,
    };

    if (consentCookie?.value) {
        try {
            const parsed = JSON.parse(consentCookie.value);
            if (typeof parsed.analytics === 'boolean' && typeof parsed.marketing === 'boolean') {
                consent = { ...consent, ...parsed };
            }
        } catch (e) {
            // Invalid cookie, will default to false and show banner
        }
    }
    
    const showBanner = !consentCookie;

    return (
        <>
            {consent.analytics && (
                <>
                    <Script
                        id="gtag"
                        strategy="afterInteractive"
                        src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_TAG_ID"
                    />
                    <Script id="gtag-init" strategy="afterInteractive">
                      {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-YOUR_TAG_ID');
                      `}
                    </Script>
                </>
            )}
            {consent.marketing && (
                <>
                    <Script id="meta-pixel" strategy="afterInteractive">
                      {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', 'YOUR_PIXEL_ID');
                        fbq('track', 'PageView');
                      `}
                    </Script>
                     <noscript>
                        <img 
                            height="1" 
                            width="1" 
                            style={{ display: 'none' }}
                            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
                        />
                    </noscript>
                </>
            )}

            {showBanner && <CookieBanner />}
        </>
    );
}
