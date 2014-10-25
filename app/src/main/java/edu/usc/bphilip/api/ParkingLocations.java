package edu.usc.bphilip.api;

/**
 * Created by bijil_000 on 10/9/2014.
 */

import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class ParkingLocations extends AsyncTask<String, String, String> {

    protected String doInBackground(String... params) {
        /*
            params[0] is the url
            params[1] is  the latitude
            params[2] is the longitude
            params[3] is the radius
         */
        String endpointURL = params[0];
        double latitude = Double.parseDouble(params[1]);
        double longitude = Double.parseDouble(params[2]);
        double radius = Double.parseDouble(params[3]);
        String pointString = "POINT("+longitude+"%20"+latitude+")";
        Log.d("Longitude", longitude+"");

        try{
            endpointURL += "?point="+pointString+"&radius="+radius;
            URL url = new URL(endpointURL);
            HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
            //InputStream in = new BufferedInputStream(urlConnection.getInputStream());
            BufferedReader buf = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
            StringBuilder tmpResult = new StringBuilder();
            String line = null;
            while((line=buf.readLine())!=null){
                tmpResult.append(line);
            }
            String resultJSON = tmpResult.toString();
            //log entries
            Log.d("MyApp", "Recieved the JSON of parking locations");
            Log.d("MyApp", resultJSON);
            //end
            return  resultJSON;

        }
        catch(Exception e){
            Log.d("MyApp", e.getMessage());
            System.out.println(e.getMessage());
            return e.getMessage();
        }
    }
}