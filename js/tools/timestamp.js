(function () {


    let timer = null;


    let initialized = false;



    function initTimestampTool() {


        if (initialized) {

            return;

        }


        const datetimeInput =
            document.getElementById(
                "datetimeInput"
            );


        if (!datetimeInput) {

            return;

        }


        initialized = true;



        const currentTime =
            document.getElementById(
                "currentTime"
            );



        const timestampInput =
            document.getElementById(
                "timestampInput"
            );





        function pad(num) {


            return String(num)
                .padStart(2, "0");


        }





        /*
            格式化日期
        */

        function formatDate(date) {


            return (

                date.getFullYear()
                + "-"
                + pad(date.getMonth() + 1)
                + "-"
                + pad(date.getDate())

                + " "

                + pad(date.getHours())

                + ":"

                + pad(date.getMinutes())

                + ":"

                + pad(date.getSeconds())

            );


        }






        /*
            当前时间
        */


        function updateCurrentTime() {


            currentTime.innerText =
                formatDate(
                    new Date()
                );


        }



        updateCurrentTime();



        clearInterval(timer);


        timer =
            setInterval(
                updateCurrentTime,
                1000
            );









        /*
            设置默认当前时间
        */


        function setDefaultTime(){


            const now =
                new Date();



            const value =


                now.getFullYear()
                + "-"
                + pad(now.getMonth()+1)
                + "-"
                + pad(now.getDate())

                + "T"

                + pad(now.getHours())
                + ":"
                + pad(now.getMinutes())
                + ":"
                + pad(now.getSeconds());



            datetimeInput.value =
                value;



            convertDate();



        }









        /*
            日期转时间戳
        */


        function convertDate(){



            const date =
                new Date(
                    datetimeInput.value
                );



            if(
                isNaN(
                    date.getTime()
                )
            ){

                return;

            }




            // 秒级

            document.getElementById(
                "timestampResult"
            ).value =

                Math.floor(
                    date.getTime()/1000
                );




            // 毫秒级

            document.getElementById(
                "timestampMsResult"
            ).value =

                date.getTime();



            // 同步输入框

            timestampInput.value =
                date.getTime();



        }









        /*
            时间戳转日期
        */


        function convertTimestamp(){



            let value =
                timestampInput.value.trim();



            if(!value){

                return;

            }





            if(
                !/^\d+$/.test(value)
            ){

                alert(
                    "时间戳只能输入数字"
                );

                return;

            }




            let timestamp;




            /*
                10位 秒
            */

            if(
                value.length === 10
            ){


                timestamp =
                    Number(value) * 1000;


            }



            /*
                13位 毫秒
            */

            else if(
                value.length === 13
            ){


                timestamp =
                    Number(value);


            }



            else {


                alert(
                    "请输入10位或13位时间戳"
                );


                return;


            }






            const date =
                new Date(
                    timestamp
                );





            if(
                isNaN(
                    date.getTime()
                )
            ){

                alert(
                    "无效时间戳"
                );

                return;

            }




            document.getElementById(
                "datetimeResult"
            ).value =

                formatDate(date);



        }








        /*
            按钮事件
        */


        document
        .getElementById(
            "dateToTimestampBtn"
        )
        .addEventListener(
            "click",
            convertDate
        );




        document
        .getElementById(
            "timestampToDateBtn"
        )
        .addEventListener(
            "click",
            convertTimestamp
        );





        // 初始化

        setDefaultTime();



    }





    window.initTimestampTool =
        initTimestampTool;



})();