package edu.usc.bphilip.collabparking;

import android.app.Activity;
import android.location.Location;
import android.os.Bundle;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import org.json.JSONArray;
import org.json.JSONObject;

import edu.usc.bphilip.api.ParkingLocations;

/**
 * Created by bijil_000 on 10/21/2014.
 */

public class ParkingMap extends MapFragment {
    private GoogleMap mMap;

    @Override
    public void onCreate(Bundle arg0) {
        super.onCreate(arg0);
        //mMap = getMap();
        Log.d("Debug-Collabparking", "Just before setUpIfNeeded");
        //setUpMapIfNeeded();
    }


    @Override
    public View onCreateView(LayoutInflater mInflater, ViewGroup arg1,
                             Bundle arg2) {
        Log.d("Debug-Collabparking", "In oncreateview");
        return super.onCreateView(mInflater, arg1, arg2);
    }

    @Override
    public void onInflate(Activity arg0, AttributeSet arg1, Bundle arg2) {
        super.onInflate(arg0, arg1, arg2);
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        Log.d("Debug-Collabparking", "In onActivity");
        setUpMapIfNeeded();
    }

    private void setUpMapIfNeeded() {
        // Do a null check to confirm that we have not already instantiated the map.
        if (mMap == null) {
            // Try to obtain the map from the SupportMapFragment.
            //mMap = ((SupportMapFragment) myContext.getSupportFragmentManager().findFragmentById(R.id.map))
              //      .getMap();

            //mMap = ((MapFragment) getFragmentManager().findFragmentById(R.id.map)).getMap();
            /*SupportMapFragment mapFrag = (SupportMapFragment) getSupportFragmentManager()
                    .findFragmentById(R.id.map);*/

            mMap = getMap();
            // Check if we were successful in obtaining the map.
            Log.d("Debug-Collabparking", (mMap == null)+" is it null");
            if (mMap != null) {
                setUpMap();
            }
        }
    }



    private void setUpMap() {
        //LocationClient locCl = new LocationClient();
        //Location mCurrentLocation;
        Log.d("Debug-Collabparking", "In setupMap");
        mMap.setMyLocationEnabled(true);
        mMap.moveCamera(CameraUpdateFactory.zoomTo(15));
        //LocationManager locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        GPSTracker gps = new GPSTracker(getActivity());
        if(gps.canGetLocation()){
            LatLng currentPosition =  new LatLng(gps.getLatitude(), gps.getLongitude());
            mMap.moveCamera(CameraUpdateFactory.newLatLng(currentPosition));
        }
            mMap.setOnMyLocationChangeListener(new GoogleMap.OnMyLocationChangeListener() {

            @Override
            public void onMyLocationChange(Location arg0) {
                // TODO Auto-generated method stub
                //float zoomLevel = 14;
                LatLng currentPosition = new LatLng(arg0.getLatitude(), arg0.getLongitude());
                mMap.clear();
                mMap.addMarker(new MarkerOptions().position(currentPosition).title("Me"));
                //float zoomLevel = mMap.getCameraPosition().zoom;
                //mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(currentPosition, zoomLevel));


                //fetching the parking locations
                try {
                    ParkingLocations parkloc = new ParkingLocations();
                    String url = "http://54.69.152.156:55321/csp/data/parking/query/point";
                    String radius="5000";
                    parkloc.execute(url,""+arg0.getLatitude(), arg0.getLongitude()+"" ,radius);

                    String resultJSON = parkloc.get();
                    addParkingMarker(resultJSON);
                }
                catch(Exception e){
                    e.printStackTrace();
                }
            }
        });
        //LatLng currentPosition = new LatLng(34.0205, -118.2856);
        //mMap.addMarker(new MarkerOptions().position(currentPosition).title("Me"));

    }

    private void addParkingMarker(String resultJSON){
        //parse the result json
        try {
            JSONArray parkingLocations = new JSONArray(resultJSON);
            for(int i=0; i<parkingLocations.length(); i++){
                JSONObject parkingLoc = parkingLocations.getJSONObject(i);
                String location = parkingLoc.getString("location");
                location=location.replace("POINT (","");
                location=location.replace(")","");
                String[] coordinates = location.split(" ");
                float longitude = Float.parseFloat(coordinates[0]);
                float latitude = Float.parseFloat(coordinates[1]);
                String name = parkingLoc.getString("name");
                LatLng parkingSpot = new LatLng(latitude, longitude);

                BitmapDescriptor parkingBitmap = BitmapDescriptorFactory.fromResource(R.drawable.parking_marker);
                Marker psMarker = mMap.addMarker(new MarkerOptions().position(parkingSpot)
                                .icon(parkingBitmap)
                                .title(name)
                                .snippet("Capacity: 60")
                );
            }
        }
        catch(Exception e){
            e.printStackTrace();
        }
    }

}
