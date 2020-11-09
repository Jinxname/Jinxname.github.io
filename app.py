
# from selenium import webdriver

from appium import webdriver
import time
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException  #导入NoSuchElementException

desired_caps = {

                'platformName': 'Android',

                'deviceName': '127.0.0.1:7555',

                'platformVersion': '6.0.1',

                # apk包名

                'appPackage': 'com.xhao.dxqb',

                # apk的launcherActivity

                'appActivity': 'com.xhao.dxqb.ui.activity.MainActivity',
                #启动app时不清除app里的原有的数据
                'noReset':True

                }


driver = webdriver.Remote('http://127.0.0.1:4723/wd/hub', desired_caps)


time.sleep(4)
# driver.find_element_by_id('com.android.settings:id/password_entry').click()
driver.find_element_by_id('com.android.settings:id/password_entry').send_keys(1234)

time.sleep(1)

#按下enter键
driver.press_keycode(66)



#41-53 44 53
#等待3秒
time.sleep(2)


def check_button(_self1,_self2):
    try:
        _self1 = driver.find_element_by_id(_self2)
    except NoSuchElementException:
        _self1 = _self1 + '.png'
        driver.save_screenshot(_self1)
        driver.get_screenshot_as_file(_self1)
        print(_self1 + '失败')
    else:
        _self1.click()

check_button('rb_mine','com.xhao.dxqb:id/rb_mine_dot')