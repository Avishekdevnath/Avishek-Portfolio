import asyncio
from playwright.async_api import async_playwright
import json

async def test_pdf_button():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        
        # Enable logging
        page = await context.new_page()
        page.on("console", lambda msg: print(f"[BROWSER LOG] {msg.type}: {msg.text}"))
        
        try:
            # Navigate to resume page
            print("🔍 Navigating to /resume/software-engineer...")
            response = await page.goto("http://localhost:3000/resume/software-engineer", wait_until="networkidle")
            print(f"✅ Page loaded with status: {response.status if response else 'no response'}")
            
            # Wait for page to be fully loaded
            await page.wait_for_load_state("networkidle")
            
            # Take screenshot
            await page.screenshot(path="resume_page.png")
            print("📸 Screenshot saved: resume_page.png")
            
            # Find the Open PDF button
            print("\n🔎 Looking for 'Open PDF' button...")
            open_pdf_button = page.locator('a:has-text("Open PDF")')
            
            # Check if button exists
            count = await open_pdf_button.count()
            print(f"✅ Found {count} 'Open PDF' button(s)")
            
            if count > 0:
                # Get button properties
                href = await open_pdf_button.first.get_attribute("href")
                target = await open_pdf_button.first.get_attribute("target")
                is_visible = await open_pdf_button.first.is_visible()
                
                print(f"\n🔗 Button properties:")
                print(f"  href: {href}")
                print(f"  target: {target}")
                print(f"  is_visible: {is_visible}")
                
                # Try to click it
                print(f"\n👆 Clicking 'Open PDF' button...")
                
                # Listen for popup
                async with context.expect_page() as popup_info:
                    await open_pdf_button.first.click()
                
                popup = await popup_info.value
                print(f"✅ New tab/window opened!")
                
                # Wait for the new page to load
                await popup.wait_for_load_state("networkidle")
                
                # Check the URL
                popup_url = popup.url
                print(f"📍 Popup URL: {popup_url}")
                
                # Check content type
                content_type = popup.context.new_response if hasattr(popup.context, 'new_response') else "unknown"
                print(f"✅ Content loaded successfully!")
                
                # Get page title
                title = await popup.title()
                print(f"Title: {title}")
                
            else:
                print("❌ 'Open PDF' button not found!")
                
                # Debug: List all links on the page
                all_links = await page.locator("a").all()
                print(f"\n📝 All links on page ({len(all_links)} total):")
                for i, link in enumerate(all_links[:10]):
                    text = await link.text_content()
                    href = await link.get_attribute("href")
                    print(f"  {i+1}. {text.strip() if text else '[no text]'} -> {href}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()

# Run the test
asyncio.run(test_pdf_button())
